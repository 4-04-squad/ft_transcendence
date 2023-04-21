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

    return {
      userStore,
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
              console.log(err);
            });
        } catch (error: any) {
          console.log(error);
        }
      }
    },
  },
});
</script>
