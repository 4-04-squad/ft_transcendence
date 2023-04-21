<template>
  <div id="page-games"></div>
  <div v-if="gameData">
    <p>Game status: {{ gameData.status }}</p>
    <p>Game ID: {{ gameData.id }}</p>
  </div>
  <div v-if="users && users.length > 0">
    <p>User name: {{ users[0].pseudo }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { GameInterface } from "@/interfaces/game.interface";
import axios from "axios";
import type { UserInterface } from "@/interfaces/user.interface";

export default defineComponent({
  name: "GamesView",
  setup() {
    const route = useRoute();
    const gameData = ref<GameInterface | null>(null);
    const users = ref<UserInterface[] | null>(null);

    // Fetch chat data on route change
    watch(
      () => route.params.id,
      async (newVal, oldVal) => {
        console.log("newVal", newVal);
        console.log("oldVal", oldVal);
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
        } catch (err) {
          console.error(err);
        }
      },
      { immediate: true } // Call the function immediately when the component is created
    );
    return {
      gameData: gameData,
      users: users,
    };
  },
});
</script>
