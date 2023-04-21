<template>
  <h2 class="users-list__title">{{ title }}</h2>
  <div :class="`users-list users-list--${status}`">
    <div
      class="users-list__item"
      v-for="user in users"
      :key="user.id"
      v-if="users.length"
    >
      <UserCard :menu="true" :user="user" :full="'full'" />
    </div>
    <p class="users-list__message" v-else>
      Aucun utilisateurs
      <span :class="`status ${status.toLowerCase()}`">{{ status }}</span>
    </p>
  </div>
</template>

<script lang="ts">
import type { UserInterface } from "@/interfaces/user.interface";
import { defineComponent, ref } from "vue";
import UserCard from "./UserCard.vue";
import axios from "axios";

type Status = "ONLINE" | "OFFLINE" | "PLAYING";

export default defineComponent({
  name: "UsersList",
  components: { UserCard },
  props: {
    title: {
      type: String,
      default: "Liste des utilisateurs",
    },
    limit: {
      type: String,
      default: "5",
    },
    status: {
      type: String as () => Status,
      default: "ONLINE",
    },
  },
  setup(props) {
    const users = ref([] as UserInterface[]);

    const response = axios
      .get(
        `${import.meta.env.VITE_APP_API_URL}/users/${props.status}/${
          props.limit
        }`,
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        users.value = response.data.users;
      })
      .catch((error) => {
        console.log(error);
      });

    return {
      users,
    };
  },
});
</script>

<style lang="scss">
.users-list {
  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  &__message {
    text-align: center;
  }

  &__item {
    margin-bottom: 1rem;

    .user-card {
      grid-gap: 0;
      background-color: var(--border-color);
      border-radius: var(--radius);

      &__avatar {
        padding: 0.2rem;
      }
    }
  }
}
</style>
