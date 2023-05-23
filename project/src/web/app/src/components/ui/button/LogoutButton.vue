<template>
  <button @click="logout" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import router from "@/router";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
  name: "LogoutButton",
  props: {
    class: {
      type: String,
      default: "",
    },
  },
  setup() {
    const userStore = useUserStore();
	const alertStore = useAlertStore();

    return {
      userStore,
	  alertStore
    };
  },
  methods: {
    async logout() {
      if (this.userStore.user) {
        try {
          const response = await axios
            .get(
              `${import.meta.env.VITE_APP_API_URL}/auth/signout/${
                this.userStore.user.id
              }`,
              {
                withCredentials: true,
              }
            )
            .then((res) => {
              this.userStore.clearUser();
              console.log(res);
              if (!this.userStore.user) {
                console.log("User is logged out");
                router.push({ path: "/login" });
              }
            })
            .catch((err) => {
				const alert = {
					status: err.response.data.statusCode,
					message: err.response.data.message,
				} as AlertInterface;

				this.alertStore.setAlert(alert);
            });
        } catch (error: any) {
          console.log(error);
        }
      }
    },
  },
});
</script>
