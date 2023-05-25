<template>
  <div id="page-chanels">
    <ChatConversation v-if="channelData" :chat="channelData" :socket="socket" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, onMounted, watch, ref, inject } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import type { Socket } from "socket.io-client";
import axios from "axios";
import ChatConversation from "@/components/chats/ChatConversation.vue";
import { useUserStore } from "@/stores/user";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
  name: "ChanelsView",
  components: { ChatConversation },
  setup() {
    const route = useRoute();
    let channelData = ref(null);
    const userStore = useUserStore();
    const socket = inject('socket') as Socket;
    const alertStore = useAlertStore();

    socket.on("ban", (data: any) => {
      if (data.userId == userStore.user.id) {
        const alert = {
          status: 403,
          message: 'You are banned from this channel',
        } as AlertInterface;

        alertStore.setAlert(alert);
        router.push({
          name: "channels",
        });
      }
    });

    socket.on("kick", (data: any) => {
      if (data.userId == userStore.user.id) {
        const alert = {
          status: 403,
          message: 'You are kicked from this channel',
        } as AlertInterface;

        alertStore.setAlert(alert);
        router.push({
          name: "channels",
        });
      }
    });

    const fetchChatDataAndJoinChat = async (chatId: string) => {
      if (chatId) {
          const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/channels/${chatId}`, {
            withCredentials: true,
          }).then((response) => {
            channelData.value = response.data;
            socket.emit("joinChat", { chatId: chatId, userId: userStore.user.pseudo });
          }).catch((err) => {
            const alert = {
                    status: err.response.data.statusCode,
                    message: err.response.data.message,
                  } as AlertInterface;

                  alertStore.setAlert(alert);
            router.push({
              name: "channels",
            });
        })
      }
    }

    // Fetch chat data on route change
    watch(
      
      () => route.params.id,
      async (newVal, oldVal) => {
        if(newVal) {
                axios.get(`${import.meta.env.VITE_APP_API_URL}/channels/me/${newVal}`, {
              withCredentials: true,
            }).then((response) => {
              if (response.data.chat.permission == "BANNED") {
                const alert = {
                    status: 403,
                    message: 'You are banned from this channel',
                  } as AlertInterface;
                  alertStore.setAlert(alert);
                router.push({
                  name: "channels",
                });
              } else {

                if (oldVal) {
                  socket.emit("leaveChat", { chatId: oldVal, userId: userStore.user.pseudo });
                }
                fetchChatDataAndJoinChat(newVal as string);
              }
            }).catch((err) => {
              const alert = {
                status: err.response.status,
                message: err.response.data.message,
              } as AlertInterface;
              alertStore.setAlert(alert);
            });
        }
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
      channelData: channelData,
    };
  },
});
</script>

<style lang="scss">
#page-chanels {
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