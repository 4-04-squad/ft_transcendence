<template>
    <button @click="permissionMember(user, channel, permission, status)" :class="class">
      <slot></slot>
    </button>
  </template>
  
  <script lang="ts">
  import { defineComponent, inject } from "vue";
  import { useUserStore } from "@/stores/user";
  import axios from "axios";
  import router from "@/router";
  import { UserChatPermission } from "@/interfaces/user.interface"
import type { Socket } from "socket.io-client";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
  
  export default defineComponent({
    name: "permissionMemberButton",
    props: {
      class: {
        type: String,
        default: "",
      },
      user: {
        type: String,
        default: "",
        required: true,
      },
      channel: {
        type: String,
        default: "",
        required: true,
      },
      permission: {
        type: String,
        default: "COMPLIANT",
      },
      status: {
        type: String,
        default: "MEMBER",
      },

    },
    setup(props) {
      const userStore = useUserStore();
      const alertStore = useAlertStore();
      const socket = inject("socket") as Socket;
  
      return {
        userStore,
        socket,
        user: props.user,
        channel: props.channel,
        permission: props.permission,
        status: props.status,
        alertStore,
      };
    },
    methods: {
      async permissionMember(user: string, channel: string, permission: string, status: string) {
          const response = await axios
            .patch(
              `${import.meta.env.VITE_APP_API_URL}/channels/memberStatus`,
              {
                chatId: channel,
                userId: user,
                permission: permission,
                status: status,
              },
              {
                withCredentials: true,
                headers: {"Content-Type": "application/json",
                },
              }
            )
            .then((res) => {
              if (permission == "BANNED") {
                this.socket.emit("ban", { chatId: channel, userId: user });
              }
              if (permission == "KICKED") {
                this.socket.emit("kick", { chatId: channel, userId: user });
              }
            })
            .catch((err) => {
              const alert = {
                status: err.response.status,
                message: err.response.data.message,
              } as AlertInterface;

              this.alertStore.setAlert(alert);
            });
        },
      },
  });
  </script>
  