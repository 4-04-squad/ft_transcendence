<template>
  <button :class="`user-card grid ${full}-card`" v-if="user" @click="converse">
      <div :class="`column user-card__avatar ${size}`">
        <img :src="user.avatar" :alt="user.pseudo" />
        <div
          :class="`user-card__status ${user.status.toLocaleLowerCase()}`"
        ></div>
      </div>
      <div class="column user-card__details">
        <h3 class="pseudo">@{{ user.pseudo }}</h3>
        <p v-if="info.length" class="info">{{ info }}</p>
        <p v-if="preview.length" class="preview">{{ preview }}</p>
      </div>
    </button>
</template>

<script lang="ts">
import { RouterLink } from "vue-router";
import type { UserInterface } from "@/interfaces/user.interface";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { ChatInterface } from "@/interfaces/chat.interface";

type Size = "medium" | "small" | "large";
type CardSize = "full" | "half";

export default defineComponent({
  name: "UserCard",
  components: {
    RouterLink,
  },
  props: {
    chat: {
      type: Object as () => ChatInterface,
      required: true,
    },
    user: {
      type: Object as () => UserInterface,
      default: undefined,
    },
    full: {
      type: String as PropType<CardSize>,
      default: "full",
    },
    size: {
      type: String as PropType<Size>,
      default: "medium",
    },
    info: {
      type: String,
      default: "",
    },
    preview: {
      type: String,
      default: "",
    },
  },
  methods: {
    converse() {
      this.$router.push({
        name: "chat",
        params: {
          id: this.chat.id,
        },
      });
    },
  },

});
</script>
