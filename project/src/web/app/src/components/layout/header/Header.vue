<template>
  <header class="main-header">
    <nav class="main-nav main-nav--login">
      <UserCard :user="userStore.user" v-if="userStore.user" :full="'half'" />
      <LoginButton v-else class="login">
        <LoginIcon />
      </LoginButton>
    </nav>
    <nav class="main-nav main-nav--link">
      <RouterLink :to="{ name: 'home' }" class="link">
        <HomeIcon />
      </RouterLink>
      <RouterLink :to="{ name: 'games' }" class="link games-all">
        <GameIcon />
      </RouterLink>
      <RouterLink :to="{ name: 'channels' }" class="link channels-all">
        <GlobeIcon />
      </RouterLink>
      <RouterLink :to="{ name: 'chats' }" class="link chats-all">
        <MessageIcon />
      </RouterLink>
      <RouterLink :to="{ name: 'users-all' }" class="link users-all">
        <UsersIcon />
      </RouterLink>
      <button class="link menu">
        <MenuIcon />
      </button>
    </nav>
    <nav class="main-nav main-nav--settings">
      <RouterLink :to="{ name: 'about' }" class="link">
        <InfoIcon />
      </RouterLink>
      <LogoutButton v-if="userStore.user" :class="'link'">
        <button class="link">
          <LogoutIcon />
        </button>
      </LogoutButton>
      <ThemeSwitcher />
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RouterLink } from "vue-router";
import UserCard from "@/components/user/UserCard.vue";
import ThemeSwitcher from "@/components/themes/ThemeSwitcher.vue";
import LogoutButton from "@/components/ui/button/LogoutButton.vue";
import LoginButton from "@/components/ui/button/LoginButton.vue";
import {
  HomeIcon,
  InfoIcon,
  LogoutIcon,
  LoginIcon,
  MessageIcon,
  GlobeIcon,
  GameIcon,
  UsersIcon,
  MenuIcon,
} from "@/components/icons";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  name: "Header",
  components: {
    RouterLink,
    UserCard,
    ThemeSwitcher,
    HomeIcon,
    InfoIcon,
    LogoutIcon,
    LoginIcon,
    MessageIcon,
    GlobeIcon,
    GameIcon,
    UsersIcon,
    LogoutButton,
    LoginButton,
    MenuIcon,
  },
  setup() {
    const userStore = useUserStore();

    return {
      userStore,
    };
  },
});
</script>
