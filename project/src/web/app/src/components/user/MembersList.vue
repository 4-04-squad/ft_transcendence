<template>
  <h2 class="users-list__title">{{ title }}</h2>
  <div :class="`users-list users-list--${channel}`">
    <div
      class="users-list__item"
      v-for="member in members"
      :key="member.id"
      v-if="members.length"
    >
      <UserCard :user="member" :full="'full'" />
    </div>
    <p class="users-list__message" v-else>Aucun membres</p>
  </div>
</template>

<script lang="ts">
import type { UserInterface } from "@/interfaces/user.interface";
import { defineComponent, ref, watch } from "vue";
import UserCard from "./UserCard.vue";
import axios from "axios";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "MembersList",
  components: { UserCard },
  props: {
    title: {
      type: String,
      default: "Membres",
    },
    channel: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const route = useRoute();
    const owner = ref(Object as () => UserInterface);
    const admins = ref([] as UserInterface[]);
    const members = ref([] as UserInterface[]);


    // TODO: Add channels members API controller
    // Watch for changes to route params and fetch user data again
    watch(
      () => route.params,
      async () => {
        if (route.params.id) {
          // Get user by pseudo from API if we are on another user profile
          const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/channels/${route.params.id}`, {
            withCredentials: true,
          })
          .then((response) => {
            members.value = response.data.users;
          })
          .catch((error) => {
            console.log(error);
          });
        }
      },
      { immediate: true } // Call the function immediately when the component is created
    );

    return {
      owner,
      admins,
      members,
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
