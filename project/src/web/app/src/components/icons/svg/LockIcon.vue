<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="size"
    :height="size"
    :class="class"
    class="feather feather-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LockIcon",
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
.feather-lock {
  fill: none !important;
}
.dark {
  .feather-lock {
    fill: none !important;
  }
}
</style>