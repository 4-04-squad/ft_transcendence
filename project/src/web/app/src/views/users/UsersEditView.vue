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
      <form class="forms" @submit.prevent="updateUser">
        <!-- User: avatar upload -->
        <div class="user-card grid full-card">
          <div class="column user-card__avatar large">
            <img :src="user?.avatar" alt="avatar" />
          </div>
          <div class="user-card__upload">
            <label for="avatar">Changer l'avatar</label>
            <input type="file" id="avatar" name="avatar" />
          </div>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label for="pseudo">Pseudo</label>
            <input
              type="text"
              id="pseudo"
              name="pseudo"
              :value="user?.pseudo"
            />
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" :value="user?.email" />
          </div>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label for="firstname">Nom</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              :value="user?.firstName"
            />
          </div>
          <div class="form-field">
            <label for="lastname">Prénom</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              :value="user?.lastName"
            />
          </div>
        </div>
        <div class="form-field">
          <label for="about">Bio</label>
          <textarea
            name="about"
            id="about"
            cols="30"
            rows="4"
            :value="user?.about"
          ></textarea>
        </div>
        <div class="form-field" v-if="user?.role === 'ADMIN'">
          <label for="role">Role</label>
          <select name="role" id="role">
            <option value="user">USER</option>
            <option value="admin">ADMIN</option>
          </select>
        </div>
        <div class="form-fields form-fields--btns">
          <input class="btn btn--submit" type="submit" value="Modifier" />
          <button
            class="btn btn--delete"
            @click.prevent="deleteUser"
            v-if="user?.role === 'ADMIN'"
          >
            Supprimer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import type { UserInterface } from "@/interfaces/user.interface";
import { useUserStore } from "@/stores/user";
import { useRoute } from "vue-router";
import axios from "axios";
import { defineComponent } from "vue";
import { EditIcon } from "@/components/icons";

export default defineComponent({
  name: "UsersEditView",
  components: {
    EditIcon,
  },
  setup() {
    const userStore = useUserStore();

    return {
      userStore,
    };
  },
  async created() {
    const userStore = useUserStore();
    const route = useRoute();

    let user: UserInterface | undefined = undefined;

    // Check current route params to know if we are on the current user profile or not
    if (route.params.id) {
      // Get user by pseudo from API if we are on another user profile
      const response = await axios
        .get(`${import.meta.env.VITE_APP_API_URL}/users/${route.params.id}`, {
          withCredentials: true,
        })
        .then((response) => {
          user = response.data.user;
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // Get current user from store
      user = userStore.user;
    }

    this.$data.user = user;
  },
  data() {
    return {
      user: undefined as UserInterface | undefined,
    };
  },
  methods: {
    async updateUser(event: { preventDefault: () => void; target: any }) {
      event.preventDefault();

      // TODO: convert to FormData to JSON

      try {
        await axios.patch(
          `${import.meta.env.VITE_APP_API_URL}/users/${this.user?.id}`,
          formObject,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        alert("User updated successfully!");
      } catch (error) {
        console.log(error);
      }
    },
    async deleteUser() {
      if (!confirm("Voulez-vous vraiment supprimer votre compte ?")) {
        return;
      }
      try {
        await axios.delete(
          `${import.meta.env.VITE_APP_API_URL}/users/${this.user?.id}`,
          {
            withCredentials: true,
          }
        );
        // Remove the user from the store
        this.userStore.setUser(undefined);
        // Navigate to the home page
        this.$router.push("/login");
      } catch (error) {
        console.log(error);
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
