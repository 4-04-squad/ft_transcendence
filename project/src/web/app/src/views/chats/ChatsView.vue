<template>
  <div id="page-chats">
    <ChatConversation v-if="chatData" :chat="chatData" :socket="socket" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, watch, ref, inject, onMounted } from "vue";
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

    const fetchChatDataAndJoinChat = async (chatId: string) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/chats/${chatId}`, {
          withCredentials: true,
<<<<<<< Updated upstream
        });
        chatData.value = response.data.data;
        socket.emit("joinChat", { chatId: chatId, userId: userStore.user.pseudo });
      } catch (err) {
        console.error(err);
      }
=======
        }).then((response) =>{
          chatData.value = response.data.data;
          socket.emit("joinChat", { chatId: chatId, userId: userStore.user.pseudo });
        }).catch((err) => {
          const alert = {
						status: err.response.status,
						message: err.response.data.message,
					} as AlertInterface;
					alertStore.setAlert(alert);
      });
>>>>>>> Stashed changes
    }

    // Fetch chat data on route change
    watch(
      () => route.params.id,
      async (newVal, oldVal) => {
        if (oldVal) {
          socket.emit("leaveChat", { chatId: oldVal, userId: userStore.user.pseudo });
        }
        await fetchChatDataAndJoinChat(newVal as string);
      },
      { immediate: true } // Call the function immediately when the component is created
    );

    onUnmounted(() => {
      socket.emit("leaveChat", { chatId: route.params.id, userId: userStore.user.pseudo });
    });

    onMounted(() => {
      // Call the function when the page is reloaded
      socket.emit("leaveChat", { chatId: route.params.id, userId: userStore.user.pseudo });
      fetchChatDataAndJoinChat(route.params.id as string);
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