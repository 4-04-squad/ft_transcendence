<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-airplay">
    <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
    <polygon points="12 15 17 21 7 21 12 15"></polygon>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AirplayIcon",
  props: {
    size: {
      type: Number,
      default: 24,
    },
    color: {
      type: String,
      default: "#000",
    },
    class: {
      type: String,
      default: "",
    },
  },
});
</script>

<style lang="scss">
.feather-airplay {
  fill: none !important;
}
.dark {
  .feather-airplay {
    fill: none !important;
  }
}
</style>