<template>
  <div id="page-chats">
    <ChatConversation :chat="chatData" :socket="socket" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, watch, ref, inject } from "vue";
import { useRoute } from "vue-router";
import type { Socket } from "socket.io-client";
import axios from "axios";
import ChatConversation from "@/components/chats/ChatConversation.vue";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  name: "ChatsView",
  components: { ChatConversation },
  setup() {
    const route = useRoute();
    let chatData = ref(null);
    const userStore = useUserStore();
    const socket = inject('socket') as Socket;


    // Fetch chat data on route change
    watch(
      () => route.params.id,
      async (newVal, oldVal) => {
        if (oldVal) {
          socket.emit("leaveChat", { chatId: route.params.id, userId: userStore.user.pseudo });
        } else {
          socket.connect();
        }

        try {
          if (!newVal) return;
          const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/chats/${newVal}`, {
            withCredentials: true,
          });
          chatData.value = response.data;
          socket.emit("joinChat", { chatId: newVal, userId: userStore.user.pseudo });
        } catch (err) {
          console.error(err);
        }
      },
      { immediate: true } // Call the function immediately when the component is created
    );
    
    onUnmounted(() => {
      socket.emit("leaveChat", { chatId: route.params.id, userId: userStore.user.pseudo });
      socket.disconnect();
    });

    return {
      socket: socket,
      chatData: chatData,
    };
  },
});
</script>

<style lang="scss">
#page-chats {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  grid-template-areas:
    "conversation";
    height: calc(var(--vh) * 90);
  max-height: calc(var(--vh) * 90);

  @media screen and (max-width: 768px) {
    height: calc(var(--vh) * 65);
    max-height: calc(var(--vh) * 65);
  }

  &__conversation {
    grid-area: conversation;
  }
}
</style>