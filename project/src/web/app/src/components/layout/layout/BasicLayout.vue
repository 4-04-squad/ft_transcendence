<template>
  <div class="main-basic-layout">
    <Header />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Header from "@/components/layout/header/Header.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "BasicLayout",
  components: {
    Header,
  },
});
</script>
