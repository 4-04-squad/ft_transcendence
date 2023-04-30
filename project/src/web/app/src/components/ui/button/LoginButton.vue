<template>
  <button @click="login" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import router from "@/router";
import type { UserInterface } from "@/interfaces/user.interface";

export default defineComponent({
  name: "LoginButton",
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
    async login() {
      const loginUrl = `${import.meta.env.VITE_APP_API_URL}/users/@me`;
      const token = import.meta.env.VITE_APP_FORTY_TWO_CLIENT_ID;
      const callbackUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/auth/login/callback`;
      const redirectUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${token}&redirect_uri=${callbackUrl}&response_type=code`;
      const popup = window.open(redirectUrl, "_blank", "height=600,width=600");

      popup?.addEventListener("load", () => {
        if (popup?.location.href === loginUrl) {
          popup.close();
        }
      });

      // wait for the user to complete the login process
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(loginUrl, {
            withCredentials: true,
          });
          // check if the user is logged in
          if (response.status === 206) {
            clearInterval(interval);
            popup?.close();
            
						//console.log("2fa required " + response.data.user.id);
						router.push({ path: "/login_2fa" });
					}
          else if (response.status === 200) {
            // clear the interval and close the popup
            clearInterval(interval);
            popup?.close();
            // set the default image
            if (!response.data.user.avatar) {
              await axios.patch(
                  `${import.meta.env.VITE_APP_API_URL}/users/${response.data.user.id}/edit`,
                  {
                    avatar: "/public/img/marvin.png"
                  },
                  {
                    withCredentials: true,
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
            }
            // set the user in the store
            this.userStore.setUser(response.data.user as UserInterface);
            if (this.userStore.user) {
              console.log("User is logged in " + this.userStore.user.pseudo);
              router.push({ path: "/" });
            }
          }
        } catch (error) {
          console.log(error);
        }
      }, 100);
    },
  },
});
</script>
