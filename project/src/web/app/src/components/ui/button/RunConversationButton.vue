<template>
    <button @click="runConversation(user)" :class="class">
      <slot></slot>
    </button>
  </template>
  
  <script lang="ts">
  import { defineComponent, inject } from "vue";
  import { useUserStore } from "@/stores/user";
  import axios from "axios";
  import router from "@/router";
import type { Socket } from "socket.io-client";
  
  
  export default defineComponent({
    name: "RunConversationButton",
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
    },
    setup(props) {
      const userStore = useUserStore();
      const user = props.user;
      const socket = inject('socket') as Socket;
  
      return {
        userStore,
        user,
        socket,
      };
    },
    methods: {
      async runConversation(user: string) {
        const response = await axios
          .post(
            `${import.meta.env.VITE_APP_API_URL}/chats/create`,
            {
              userId: user,
            },
            {
              withCredentials: true,
              headers: {"Content-Type": "application/json",
              },
            }
          )
          .then((res) => {
            this.socket.emit("sendNotif", {userId: user, linkId: res.data.chat.id, sender: this.userStore.user, msg: "Invited to chat. Click to join !", type: "chat"});
            router.push({name: "chat", params: {id: res.data.chat.id}})
          })
          .catch((err) => {
          });
      },
    },
  });
  </script>
  