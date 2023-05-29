<template>
  <button @click="login" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import router from "@/router";
import type { UserInterface } from "@/interfaces/user.interface";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
import type { Socket } from "socket.io-client";

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
    const alertStore = useAlertStore();
    const socket = inject('socket') as Socket;

    return {
      userStore,
      alertStore,
      socket
    };
  },
  methods: {
    async login() {
      const loginUrl = `${import.meta.env.VITE_APP_API_URL}/users/@me`;
      const callback = `${import.meta.env.VITE_APP_WEB_URL}/login`;
      const token = import.meta.env.VITE_APP_FORTY_TWO_CLIENT_ID;
      const callbackUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/auth/login/callback`;
      const redirectUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${token}&redirect_uri=${callbackUrl}&response_type=code`;
      
      const popup = parent.window.open(redirectUrl, "_blank", "height=600,width=600");

      // wait for the user to complete the login process
      const interval = setInterval(async () => {
        if (popup?.window.location.href === callback) {
          popup?.close();
          try {
            const response = await axios.get(loginUrl, {
              withCredentials: true,
            });
            // check if the user is logged in
            if (response.status === 200) {
              // clear the interval and close the popup
              clearInterval(interval);
              popup?.close();
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
        }
        
      }, 1000);
    },
  },
});
</script>
