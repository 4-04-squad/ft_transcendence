<template>
  <div class="chat-card">
    <div class="chat-card__user">
      <ChatUserCard
        :chat="chat"
        :user="user"
        :preview="formattedMessage"
        :info="user.status"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { MessageInterface } from "@/interfaces/message.interface";
import type { UserInterface } from "@/interfaces/user.interface";
import ChatUserCard from "@/components/chats/ChatUserCard.vue";
import moment from "moment";
import type { ChatInterface } from "@/interfaces/chat.interface";

export default defineComponent({
  name: "ChatCard",
  components: {
    ChatUserCard,
  },
  props: {
    chat: {
      type: Object as () => ChatInterface,
      required: true,
    },
    user: {
      type: Object as () => UserInterface,
      required: true,
    },
    lastMessage: {
      type: Object as () => MessageInterface,
      default () {
        return {
          body: "",
          createdAt: new Date(),
        };
      },
    },
  },
  computed: {
    formattedDate(): string {
      return moment(this.lastMessage.updatedAt).format("DD/MM/YYYY HH:mm:ss");
    },
    formattedMessage(): string {
      return this.lastMessage.body.length > 20
        ? this.lastMessage.body.substring(0, 20) + "..."
        : this.lastMessage.body;
    },
  },
});
</script>
