<template>
  <button @click="requestGameParty" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import router from "@/router";

export default defineComponent({
  name: "GameProposalButton",
  props: {
    class: {
      type: String,
      default: "",
    },
  },
  setup() {
    const userStore = useUserStore();

    return {
      userStore,
    };
  },
  methods: {
    async requestGameParty() {
      try {
        axios
          .post(`${import.meta.env.VITE_APP_API_URL}/games/create`)
          .then((res) => {
            console.log(res);
            router.push({ name: "game", params: { id: res.data.games.id } });
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error: any) {
        console.log(error);
      }
    },
  },
});
</script>
