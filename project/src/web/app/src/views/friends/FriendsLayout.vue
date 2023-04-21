<template>
  <MainLayout>
    <div class="friends-layout main-page-content">
      <div class="friends-layout__container">
        <div class="friends-layout__content">
          <router-view />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts">
import MainLayout from "@/components/layout/layout/MainLayout.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "FriendsLayout",
  components: {
    MainLayout,
  },
});
</script>
