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
      <button class="link menu main-nav-toggle" @click="toggleMenu">
        <span class="open">
          <MenuIcon/>
        </span>
        <span class="close">
          Fermer <XIcon/>
        </span>
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
  <MainNavContainer />
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { RouterLink } from "vue-router";
import UserCard from "@/components/user/UserCard.vue";
import ThemeSwitcher from "@/components/themes/ThemeSwitcher.vue";
import LogoutButton from "@/components/ui/button/LogoutButton.vue";
import LoginButton from "@/components/ui/button/LoginButton.vue";
import MainNavContainer from "./Nav.vue";
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
  XIcon,
} from "@/components/icons";
import { useUserStore } from "@/stores/user";
import router from "@/router";

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
    MainNavContainer,
    XIcon,
  },
  setup() {
    const userStore = useUserStore();

    const toggleMenu = () => {
      const menu = document.querySelector(".main-nav-toggle");
      const nav = document.querySelector(".main-nav-container");
      menu?.classList.toggle("active");
      nav?.classList.toggle("active");
    };

    // watch page change to close menu on any link click
    watch(
      () => router.currentRoute.value,
      () => {
        const menu = document.querySelector(".main-nav-toggle");
        const nav = document.querySelector(".main-nav-container");
        menu?.classList.remove("active");
        nav?.classList.remove("active");
      }
    );

    return {
      userStore,
      toggleMenu,
    };
  },
});
</script>

<style lang="scss">

.main-nav--login {
  .user-card{
    &__status
    {
      display: none;
    }
  }
}
.main-nav-toggle {
  .close {
    display: none;
    position: absolute;
    top: var(--spacing);
    right: var(--spacing);
    z-index: 101;
    color: var(--text-color);
    font-weight: bold;
    text-transform: uppercase;
  }

  .open {
    display: block;
  }

  &.active {
    .close {
      display: flex;
    }

    .open {
      display: none;
    }
  }
}

</style>