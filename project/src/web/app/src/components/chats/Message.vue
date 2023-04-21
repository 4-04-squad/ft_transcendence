<template>
  <article :class="['message', { 'message--current-user': isCurrentUser }]">
    <div class="message__user">
      <UserCard :user="user" :info="formattedDate" />
    </div>
    <div class="message__body">
      <p>{{ message.body }}</p>
    </div>
  </article>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import moment from "moment";
import type { UserInterface } from "@/interfaces/user.interface";
import type { MessageInterface } from "@/interfaces/message.interface";
import UserCard from "@/components/user/UserCard.vue";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  name: "Message",
  components: {
    UserCard,
  },
  props: {
    user: {
      type: Object as () => UserInterface,
      required: true,
    },
    message: {
      type: Object as () => MessageInterface,
      required: true,
    },
  },
  setup() {
    const userStore = useUserStore();

    return {
      userStore,
    };
  },
  computed: {
    formattedDate(): string {
      return moment(this.message.createdAt).format("DD/MM/YYYY HH:mm:ss");
    },
    isCurrentUser(): boolean {
      return this.userStore.user.id === this.user.id;
    },
  },
});
</script>

<style lang="scss">
.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-direction: column;
  width: 50%;

  @media screen and (max-width: 768px) {
      width: 100%;
  }

  &--current-user {
    align-items: flex-end;
    margin: 0 0 1rem auto;

    .message__body {
      background-color: var(--primary-color);
      color: var(--text-color);
      border-top-right-radius: 0;
      border-top-left-radius: 0.5rem;
    }
  }

  &__body {
    flex: 1;
    padding: 0.5rem;
    margin-top: 1rem;
    width: 100%;
    border-radius: 0.5rem;
    border-top-left-radius: 0;
    background-color: var(--bg-color);
  }
}
</style>
