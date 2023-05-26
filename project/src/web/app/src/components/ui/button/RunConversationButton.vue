<template>
    <button @click="runConversation(user)" :class="class">
      <slot></slot>
    </button>
  </template>
  
  <script lang="ts">
  import { defineComponent } from "vue";
  import { useUserStore } from "@/stores/user";
  import axios from "axios";
  import router from "@/router";
  
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
  
      return {
        userStore,
        user: props.user,
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
            router.push({name: "chat", params: {id: res.data.chat.id}})
          })
          .catch((err) => {
            console.log(err);
          });
      },
    },
  });
  </script>
  