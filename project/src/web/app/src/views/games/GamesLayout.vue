<template>
  <GameLayout>
    <div class="games-layout main-page-content">
      <div class="game-menu" v-if="isLayout">
        <GamesLobby />
      </div>
      <div class="games-layout__container" v-else>
        <div class="games-layout__content">
          <router-view />
        </div>
      </div>
    </div>
  </GameLayout>
</template>

<script lang="ts">
import GameLayout from "@/components/layout/layout/GameLayout.vue";
import GamesLobby from "@/components/games/GamesLobby.vue";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "GamesLayout",
  components: {
    GameLayout,
    GamesLobby,
  },
  setup() {

    // watch for route changes
    const route = useRoute();
    const isLayout = ref(true);
    
    // if route contains a chat id, then we are in a chat
    watch(route, () => {
      if (route.params.id) {
        isLayout.value = false;
      } else {
        isLayout.value = true;
      }
    }, { immediate: true });

    return {
      isLayout
    };
  },
});
</script>

