<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="size"
    :height="size"
    :class="class"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-unlock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UnlockIcon",
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

<style lang="scss" scoped>
.feather-unlock {
  fill: none !important;
}
.dark {
  .feather-unlock {
    fill: none !important;
  }
}
</style>