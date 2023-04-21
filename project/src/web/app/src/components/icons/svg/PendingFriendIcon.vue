<template>
  <svg
    :class="class"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-user-minus"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PendingFriendIcon",
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
.feather-user-minus {
  fill: none !important;
}

.dark {
  .feather-user-minus {
    fill: none !important;
  }
}
</style>
