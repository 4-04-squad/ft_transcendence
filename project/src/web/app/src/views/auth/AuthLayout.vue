<template>
  <BasicLayout>
    <div class="auth-layout main-page-content">
      <div class="auth-layout__container layout-container">
        <div class="auth-layout__content layout-content">
          <router-view />
        </div>
      </div>
    </div>
  </BasicLayout>
</template>

<script lang="ts">
import BasicLayout from "@/components/layout/layout/BasicLayout.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "AuthLayout",
  components: {
    BasicLayout,
  },
});
</script>
