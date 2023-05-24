<template>
  <h2 class="chats-list__title">{{ title }}</h2>
  <div class="chats-list">
    <div class="chats-list__item" v-for="chat in chats" :key="chat.id" v-if="chats.length">
      <ChatCard 
      :chat="chat"
      :user="getUser(chat)"
      @selectChat="handleChatSelection" />
    </div>
    <p class="chats-list__message" v-else>Aucun chat en cours</p>
  </div>
</template>

<script lang="ts">
import type { ChatInterface } from "@/interfaces/chat.interface";
import { defineComponent, ref } from "vue";
import ChatCard from "./ChatCard.vue";
import axios from "axios";
import { useUserStore } from "@/stores/user";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
  name: "ChatsList",
  components: { ChatCard },
  props: {
    title: {
      type: String,
      default: "Inbox",
    },
  },
  setup() {
    const alertStore = useAlertStore();
    const userStore = useUserStore();
    const chats = ref([] as ChatInterface[]);
    const selectedChat = ref(null as ChatInterface | null);

    const handleChatSelection = (chat: ChatInterface) => {
      selectedChat.value = chat;
    };

    const getUser = (chat: ChatInterface) => {
      // Detect if the user is the sender or the receiver
      if (chat.users[0].user.id === userStore.user.id) {
        return chat.users[1].user;
      } else {
        return chat.users[0].user;
      }
    };

    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/chats/@me`, {
        withCredentials: true,
      })
      .then((response) => {
        chats.value = response.data.chats;
      })
      .catch((error) => {
        const alert = {
          status: error.response.data.statusCode,
          message: error.response.data.message,
        } as AlertInterface;

        alertStore.setAlert(alert);
      });

    return {
      chats,
      userStore,
      handleChatSelection,
      getUser,
    };
  },
});
</script>

<style lang="scss">
.chats-list {
  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  &__item {
    margin-bottom: 1rem;
    overflow-y: auto;

    @media screen and (max-width: 768px) {
      margin-bottom: 0;
      width: 100%;
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
    }
  }

  .chat-card {
      @media screen and (max-width: 768px) {
        margin-right: 1rem;
      }
    }
}
</style>