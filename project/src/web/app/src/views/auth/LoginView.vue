<template>
  <div id="page-login" class="grid">
    <div class="column page-thumb"></div>
    <div class="column page-content">
      <h1>Login</h1>
      <p v-if="userStore.user">
        Connecté en tant que
        <RouterLink
          :to="{ name: 'user', params: { pseudo: userStore.user.pseudo } }"
          class="link"
        >
          {{ userStore.user.pseudo }}
        </RouterLink>
      </p>
      <p v-else>Connectez-vous pour accéder à votre espace</p>
      <LogoutButton class="btn" v-if="userStore.user">
        se deconnecter
      </LogoutButton>
      <LoginButton class="btn btn--icon" v-else>
        <QDIcon />
        profile 42
      </LoginButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";
import { QDIcon } from "@/components/icons";
import LogoutButton from "@/components/ui/button/LogoutButton.vue";
import LoginButton from "@/components/ui/button/LoginButton.vue";

export default defineComponent({
  name: "LoginView",
  components: {
    QDIcon,
    LogoutButton,
    LoginButton,
  },
  setup() {
    const userStore = useUserStore();

    return {
      userStore,
    };
  },
});
</script>

<style lang="scss" scoped>
#page-login {
  height: 100%;
  grid-template-areas: "page-thumb page-content";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;

  @media (max-width: 768px) {
    grid-template-areas:
      "page-content"
      "page-thumb";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .column {
    height: 100%;

    &.page-thumb {
      grid-area: page-thumb;
      background-color: var(--border-color);
      border-top-left-radius: var(--radius-md);
      border-bottom-left-radius: var(--radius-md);

      @media (max-width: 768px) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }

    &.page-content {
      grid-area: page-content;
      display: flex;
      justify-content: center;
      align-items: center;
      align-content: center;
      flex-direction: column;
      padding: 1rem;

      h1 {
        text-transform: uppercase;
        font-weight: bold;
        text-align: center;
        margin-bottom: 2rem;
        padding: 1rem;
        border-bottom: 2px solid var(--text-color);
      }

      p {
        text-align: center;
        margin-bottom: 4rem;

        .link {
          color: var(--primary-color);
          font-weight: bold;
        }
      }
    }
  }
}
</style>
