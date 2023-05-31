<template>
  <div id="page-games">
    <div v-if="gameData" class="game-settings">
      <p>Game status: {{ gameData.status }}</p>
      <p>Game ID: {{ gameData.id }}</p>
      <p v-if="users && users.length > 0">Player 1: {{ users[0].pseudo }}</p>
      <p v-if="users && users.length > 1">Player 2: {{ users[1].pseudo }}</p>
    </div>

    <!-- GAME VIEW -->
    <FieldView v-if="gameData" :gameData="gameData" :socket="socket" />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { GameInterface } from "@/interfaces/game.interface";
import type { UserInterface } from "@/interfaces/user.interface";
import FieldView from "@/components/pong/FieldView.vue";
import axios from "axios";
import type { Socket } from "socket.io-client";
import { useUserStore } from "@/stores/user";
import router from "@/router";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
  name: "GamesView",
  components: {
    FieldView,
  },
  setup() {
    const route = useRoute();
    const alertStore = useAlertStore();
    const gameData = ref<GameInterface | null>(null);
    const users = ref<UserInterface[] | null>(null);
    const userStore = useUserStore();
    const socket = inject('socket') as Socket;

    const fetchChatDataAndJoinGame = async (gameId: string) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/games/${gameId}`,
          {
            withCredentials: true,
          }
        );
        users.value = response.data.games.users;
        gameData.value = response.data.games;
        if (!gameData.value?.id) {
          const alert = {
            status: 401,
            message: "The game doesn't exist",
          } as AlertInterface;

<<<<<<< Updated upstream
          alertStore.setAlert(alert);
          router.push({
            name: "games",
=======
            alertStore.setAlert(alert);
            router.push({
              name: "games",
            });
          }
          if (users && users.value) {
            if (!users.value.some((u) => u.id === userStore.user.id))
              router.push({
                name: "games",
            });
          }
          
          if (gameData.value?.status === "FINISHED") {
            const alert = {
              status: 401,
              message: "The game is finished",
            } as AlertInterface;

            alertStore.setAlert(alert);
            router.push({
              name: "games",
            });
          }
          if (gameData.value) {
            userStore.setUserStatus(UserStatus.PLAYING);
            if (response.data.games.users.some((u: any) => u.id === userStore.user.id))
              socket.emit("joinGame", { gameId: gameId, userId: userStore.user.id });
          }

          }).catch (err => {
            const alert = {
              status: err.response.status,
              message: err.response.data.message,
            } as AlertInterface;

            alertStore.setAlert(alert);
            router.push({
              name: "games",
            });
>>>>>>> Stashed changes
          });
        }
        if (gameData.value?.status === "FINISHED") {
          const alert = {
            status: 401,
            message: "The game is finished",
          } as AlertInterface;

          alertStore.setAlert(alert);
          router.push({
            name: "games",
          });
        }
        if (gameData.value) {
          socket.emit("joinGame", { gameId: gameId, userId: userStore.user.pseudo });
        }
      } catch (err: any) {
        const alert = {
          status: err.response?.status,
          message: err.response?.data.message,
        } as AlertInterface;

        alertStore.setAlert(alert);
        router.push({
          name: "games",
        });
      }
    };


    // TODO: when the game is finish delete the settings from the store

    // Fetch chat data on route change
    watch(
      () => route.params.id,
      async (newVal, oldVal) => {
        try {
          if (!newVal) return;
          if (oldVal) {
            socket.emit("leaveGame", { gameId: oldVal, userId: userStore.user.pseudo });
          }
          await fetchChatDataAndJoinGame(newVal as string);
        } catch (err: any) {
          const alert = {
            status: err.response.status,
            message: err.response.data.message,
          } as AlertInterface;

          alertStore.setAlert(alert);
          router.push({
            name: "games",
          });
        }
      },
      { immediate: true } // Call the function immediately when the component is created
    );

    onUnmounted(() => {
      socket.emit("leaveGame", { gameId: route.params.id, userId: userStore.user.pseudo });
    });

    onMounted(() => {
      // Call the function when the page is reloaded
      socket.emit("leaveGame", { gameId: route.params.id, userId: userStore.user.pseudo });
      fetchChatDataAndJoinGame(route.params.id as string);
    });

    return {
      gameData: gameData,
      users: users,
      socket: socket,
    };
  },
});
</script>

<style lang="scss" scoped>
#page-games {
  position: relative;
}

.game-settings {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  color: white;
  padding: 1rem;
  border-radius: var(--radius);
}
</style>
