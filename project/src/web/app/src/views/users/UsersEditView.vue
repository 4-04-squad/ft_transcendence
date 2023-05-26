<template>
  <div id="page-users-edit" class="page-user">
    <div class="head">
      <h1 class="title">
        <EditIcon :width="30" :height="30" />
        Modifier les informations
      </h1>
    </div>
    <div class="content-wrapper">
      <!-- User: form -->
      <form class="forms">
        <!-- User: avatar upload -->
        <div class="user-card grid full-card">
          <div class="column user-card__avatar large">
            <img :src="previewUrl || user?.avatar" alt="avatar" />
          </div>
          <div class="user-card__upload">
            <label for="avatar">Changer l'avatar</label>
            <input type="file" id="avatar" name="avatar" ref="avatarRef" @change="handleFileChange" />
          </div>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label for="pseudo">Pseudo</label>
            <input type="text" id="pseudo" name="pseudo" ref="pseudo" :value="user.pseudo" />
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" ref="email" :value="user.email" />
          </div>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label for="firstname">Nom</label>
            <input type="text" id="firstname" name="firstname" ref="firstName" :value="user.firstName" />
          </div>
          <div class="form-field">
            <label for="lastname">Prénom</label>
            <input type="text" id="lastname" name="lastname" ref="lastName" :value="user.lastName" />
          </div>
        </div>
        <div class="form-field">
          <label for="about">Bio</label>
          <textarea name="about" id="about" cols="30" rows="4" ref="about" :value="user.about"></textarea>
        </div>
        <div class="form-field" v-if="user?.role === 'ADMIN'">
          <label for="role">Role</label>
          <select name="role" id="role">
            <option value="user">USER</option>
            <option value="admin">ADMIN</option>
          </select>
        </div>
        <RouterLink :to="{ name: '2fa' }" class="link">
          <button class="btn">2FA</button>
        </RouterLink>
        <div class="form-fields form-fields--btns">
          <button class="btn btn--delete" @click.prevent="deleteUser" v-if="isAllowed">
            Supprimer le compte
          </button>
          <input class="btn btn--submit" type="submit" value="Modifier" @click.prevent="updateUser" />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { useUserStore } from "@/stores/user";
import { useRoute, RouterLink } from "vue-router";
import axios from "axios";
import { defineComponent, ref } from "vue";
import { EditIcon } from "@/components/icons";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
  name: "UsersEditView",
  components: {
    EditIcon,
    RouterLink
  },
  data() {
  return {
    previewUrl: null as string | ArrayBuffer | null,
  };
},
  setup() {
    const userStore = useUserStore();
    const route = useRoute();
    const avatarRef = ref();
    const selectedFile = ref();
	const alertStore = useAlertStore();

    // Get the user from the store
    const user = userStore.user;

    // Get the user id from the route
    const userId = route.params.id;

    // only current user or admin can edit his profile
    const isAllowed = user?.id === userId || user?.role === "ADMIN";

    return {
      user,
      avatarRef,
      userStore,
      isAllowed,
      selectedFile,
	  	alertStore,
    };
  },
  methods: {
    handleFileChange(event: any) {
      this.selectedFile = event.target.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    },
    async updateUser(event: { preventDefault: () => void; }) {
      event.preventDefault();

      // Check if the user has uploaded a new avatar
      const hasFiles = this.selectedFile !== undefined;
      let avatarUrl = this.user?.avatar;

      if (hasFiles) {

        // Update user with avatar
        const formData = new FormData();
        formData.append('avatar', this.selectedFile);

        await axios.patch(`${import.meta.env.VITE_APP_API_URL}/users/${this.user?.id}/avatar`,
          formData
          , {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          })
          .then((res) => {
            this.userStore.user.avatar = res.data.user.avatar;
          })
          .catch((error) => {
            const alert = {
              status: 400,
              message: "Error uploading avatar",
            } as AlertInterface;

            this.alertStore.setAlert(alert);
          });
      }

      // Get the form Object

      const formObject = {
        pseudo: (this.$refs.pseudo as any).value,
        email: (this.$refs.email as any).value,
        firstName: (this.$refs.firstName as any).value,
        lastName: (this.$refs.lastName as any).value,
        about: (this.$refs.about as any).value,
        role: this.user.role || "USER",
      };

      // Update user without avatar
      try {
        await axios.patch(
          `${import.meta.env.VITE_APP_API_URL}/users/${this.user?.id}/edit`,
          JSON.stringify(formObject),
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            }
          }
        )
          .then((res) => {
            // Update the user in the store
            this.userStore.setUser(res.data.user);
            this.$router.push({ path: "/profile" });
          })
      } catch (error: any) {
        const alert = {
					status: 400,
					message: error.response.data.message,
				} as AlertInterface;

				this.alertStore.setAlert(alert);
				this.$router.push({ path: `/users/${this.user?.id}/edit` });
      }
    },

    async deleteUser() {
      if (!confirm("Voulez-vous vraiment supprimer votre compte ?")) {
        return;
      }
      if (this.isAllowed) {
        await axios.delete(
          `${import.meta.env.VITE_APP_API_URL}/users/${this.user?.id}`,
          {
            withCredentials: true,
          }
        ).then(() => {
          this.userStore.clearUser();
          this.$router.push({ path: "/login" });
        }).catch((error) => {
          const alert = {
            status: error.response.data.status,
            message: error.response.data.message,
          } as AlertInterface;

          this.alertStore.setAlert(alert);
        });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.user-card {
  margin-bottom: 1rem;

  &.full-card {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "avatar" "upload";
    justify-items: center;
  }

  &__avatar {
    grid-area: avatar;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__upload {
    grid-area: upload;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    label {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--color-primary);
      cursor: pointer;
    }

    input {
      display: none;
    }
  }
}
</style>
