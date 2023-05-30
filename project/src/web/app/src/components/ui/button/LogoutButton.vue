<template>
  <button @click="logout" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import router from "@/router";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
import type { Socket } from "socket.io-client";

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
    const socket = inject('socket') as Socket;

    return {
      userStore,
      alertStore,
      socket,
    };
  },
  methods: {
    async logout() {
      if (this.userStore.user) {
        axios
            .post(
              `${import.meta.env.VITE_APP_API_URL}/auth/signout`,
              {
                withCredentials: true,
              }
            )
            .then((res) => {
                  const alert = {
                  status: res.status,
                  message: res.data.message,
                } as AlertInterface;
              this.socket.emit("leaveOnline", { user: this.userStore.user });
              this.alertStore.setAlert(alert);
              this.userStore.clearUser();
              router.push({ path: "/login" });
            })
            .catch((err) => {
              const alert = {
                status: err.response.status,
                message: err.response.data.message,
              } as AlertInterface;

              this.alertStore.setAlert(alert);
        });
      }
    },
  },
});
</script>
