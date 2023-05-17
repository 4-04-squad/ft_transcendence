<template>
  <div v-if="chat" class="chat-view">
    <section class="chat-view__container">
      <div class="chat-view__container__messages">
        <Message v-for="message in messages" :key="message.id" :message="message" :user="message.user" />
      </div>
    </section>
    <form class="chat-view__submit" @submit.prevent="sendMessage">
      <input class="input" type="text" placeholder="Type a message..." v-model="newMessage" />
      <button type="submit" class="send">
        envoyer
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { MessageStatus, type MessageInterface } from "@/interfaces/message.interface";
import { useUserStore } from "@/stores/user";
import { defineComponent, ref, watch } from "vue";
import Message from "./Message.vue";
import { useRoute } from "vue-router";
import { useMessageStore } from "@/stores/messages";

export default defineComponent({
  name: "ChatConversation",
  components: {
    Message,
  },
  props: {
    socket: {
      type: Object,
      required: true,
    },
    chat: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const messages = ref([] as MessageInterface[]);
    const newMessage = ref("");
    const userStore = useUserStore();
		const messageStore = useMessageStore();
    const route = useRoute();

    const sendMessage = () => {
      if (newMessage.value.trim() !== "") {
        const message = {
          id: new Date().getTime(), // id with timestamp
          status: MessageStatus.SENT,
          createdAt: new Date(),
          updatedAt: new Date(),
          body: newMessage.value.trim(),
          user: userStore.user,
          chatId: props.chat.id || route.params.id,
        };
  
        props.socket.emit("newMessage", message);
        newMessage.value = "";
      }
    };

    props.socket.on("newMessage", (message: MessageInterface) => {
      messages.value.push(message);
			messageStore.addMessage(message);
    });

    // Reset messages array when chat changes
    watch(
      () => props.chat,
      () => {
        messages.value = messageStore.getMessages(props.chat.id || route.params.id);
      }
    );

    // Scroll to bottom when new message is added
    watch(
      () => messages.value.length,
      () => {
        const container = document.querySelector(".chat-view__container");
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }
    );

    return {
      messages,
      newMessage,
      sendMessage,
    };
  },
});
</script>

<style lang="scss">
.chat-view {
  display: grid;
  grid-template-rows: 10fr 1fr;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "message"
    "submit";
  height: calc(var(--vh) * 95);
  max-height: calc(var(--vh) * 95);

  @media screen and (max-width: 768px) {
    height: calc(var(--vh) * 65);
    max-height: calc(var(--vh) * 65);
  }

  &__container {
    grid-area: message;
    background-color: var(--border-color);
    overflow-y: scroll;
    padding: var(--spacing);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing);

    &__messages {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  }

  &__submit {
    grid-area: submit;
    display: flex;
    align-items: center;
    height: 50px;

    .input {
      flex: 1;
      background-color: var(--border-color);
      border: none;
      border-top-left-radius: var(--radius-md);
      border-bottom-left-radius: var(--radius-md);
      color: var(--text-color);
      font-size: var(--font-size-md);
      font-family: var(--font-family);
      font-weight: var(--font-weight);
      width: 100%;
      outline: none;
      height: 100%;
      padding: 1rem;
    }

    .send {
      background-color: var(--primary-color);
      text-transform: uppercase;
      padding: 0 1rem;
      height: 100%;
      border-top-right-radius: var(--radius-md);
      border-bottom-right-radius: var(--radius-md);
      margin-top: auto;
    }
  }
}
</style>