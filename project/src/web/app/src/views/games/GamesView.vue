<template>
  <div id="page-games"></div>
  <div v-if="gameData">
    <p>Game status: {{ gameData.status }}</p>
    <p>Game ID: {{ gameData.id }}</p>
    <p v-if="users && users.length > 0">User name: {{ users[0].pseudo }}</p>
    <p v-if="users && users.length > 1">User name: {{ users[1].pseudo }}</p>
    <p v-if="settings"> {{ settings }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { GameInterface, IGameSettings } from "@/interfaces/game.interface";
import type { UserInterface } from "@/interfaces/user.interface";
import { useGamesSettingsStore } from "@/stores/gamesSettingsStore";
import axios from "axios";

export default defineComponent({
  name: "GamesView",
  setup() {
    const route = useRoute();
    const gameData = ref<GameInterface | null>(null);
    const users = ref<UserInterface[] | null>(null);
    const settings = ref<IGameSettings | null>(null);
    const gamesettingsStore = useGamesSettingsStore();

    // TODO: when the game is finish delete the settings from the store

    // Fetch chat data on route change
    watch(
      () => route.params.id,
      async (newVal, oldVal) => {
        try {
          if (!newVal) return;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/games/${newVal}`,
            {
              withCredentials: true,
            }
          );
          console.log("response", response);
          users.value = response.data.games.users;
          gameData.value = response.data.games;
          settings.value = await gamesettingsStore.getGameSettings(gameData.value.id);
        } catch (err) {
          console.error(err);
        }
      },
      { immediate: true } // Call the function immediately when the component is created
    );
    return {
      gameData: gameData,
      users: users,
      settings: settings,
    };
  },
});
</script>
