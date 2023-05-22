<template>
  <div class="main-game-layout">
    <Header />
    <slot></slot>
    <Sidebar>
      <UsersList title="Utilisateurs en ligne" v-if="isLayout"/>
      <PlayersList title="Players" v-else/>
    </Sidebar>
  </div>
</template>

<script lang="ts">
import Header from "@/components/layout/header/Header.vue";
import Sidebar from "@/components/layout/sidebar/Sidebar.vue";
import UsersList from "@/components/user/UsersList.vue";
import PlayersList from "@/components/user/playersList.vue";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "GameLayout",
  components: {
    Header,
    Sidebar,
    UsersList,
    PlayersList,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
  },
  setup() {

    // watch for route changes
    const route = useRoute();
    const isLayout = ref(true);

    // if route contains a game id, then we are in a channel
    watch(route, () => {
      if (route.params.id) {
        isLayout.value = false;
      } else {
        isLayout.value = true;
      }}, { immediate: true }
    );

    return {
      isLayout
    };
  },
});
</script>
