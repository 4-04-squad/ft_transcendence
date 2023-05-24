<template>
    <nav class="main-nav-container">
        <UserCard :user="userStore.user" v-if="userStore.user" :full="'half'" />
            <LoginButton v-else class="login">
                <LoginIcon />
            </LoginButton>
      <RouterLink :to="{ name: 'users-all' }" class="link users-all">
        <UsersIcon /> Tous les utilisateurs
      </RouterLink>
      <LogoutButton v-if="userStore.user" :class="'link'">
        <button>
          <LogoutIcon /> Déconnexion
        </button>
      </LogoutButton>
      <RouterLink :to="{ name: 'about' }" class="link">
        <InfoIcon /> A propos
      </RouterLink>
    </nav>
</template>
  
<script lang="ts">
import { defineComponent } from "vue";
import { RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";
import UserCard from "@/components/user/UserCard.vue";
import LogoutButton from "@/components/ui/button/LogoutButton.vue";
import LoginButton from "@/components/ui/button/LoginButton.vue";
import { UsersIcon, InfoIcon, LoginIcon, LogoutIcon } from "@/components/icons";

export default defineComponent({
    name: "MainNavContainer",
    components: {
        RouterLink,
        UserCard,
        LogoutButton,
        LoginButton,
        UsersIcon,
        InfoIcon,
        LoginIcon,
        LogoutIcon,
    },
    setup() {
        const userStore = useUserStore();

        return {
            userStore,
        };
  },
})
</script>
  
<style lang="scss">

.main-nav-container {
    display: none;

    .user-card,
    .link {
        margin-bottom: 1rem;
    }

    &.active {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;  
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: calc(var(--vh) * 100);
        background-color: var(--bg-color);
        z-index: 100;
        color: var(--text-color);
        font-weight: bold;
    }
}
</style>
  