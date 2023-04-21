<template>
  <aside class="main-sidebar">
    <slot v-if="userStore.user"></slot>
    <div class="head head--no-user" v-else>
      <h2 class="title">Login</h2>
      <p>Connectez-vous pour accéder à votre espace</p>
      <LoginButton class="btn btn--icon">
        <QDIcon />
        profile 42
      </LoginButton>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import LoginButton from "@/components/ui/button/LoginButton.vue";
import { QDIcon } from "@/components/icons";

export default defineComponent({
  name: "Sidebar",
  components: {
    LoginButton,
    QDIcon,
  },
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
});
</script>
