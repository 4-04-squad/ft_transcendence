<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    :class="class"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"
    />
    <path d="M7 14v-4" />
    <path d="M5 12h4" />
    <path d="M16 13h.01" />
    <path d="M19 11h.01" />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "GameIcon",
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