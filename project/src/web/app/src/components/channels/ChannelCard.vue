<template>
    <button :class="`channel-card grid ${full}-card`" v-if="channel" @click="converse">
      <div :class="`column channel-card__avatar ${size}`">
        <p class="channel-card__acronyme" v-if="channel.name">{{ channel.name[0] }}</p>
        <p class="channel-card__acronyme" v-else>#</p>
      </div>
      <div class="column channel-card__details">
				<h3 class="name">#{{ channel.name ? channel.name : channel.id }}</h3>
				<button class="btn btn--icon x--icon">
          <XIcon />
        </button>
      </div>
    </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { ChatInterface } from "@/interfaces/chat.interface";
import { XIcon } from "@/components/icons";

type Size = "medium" | "small" | "large";
type CardSize = "full" | "half";

export default defineComponent({
  name: "ChannelCard",
	components: {
		XIcon
	},
  props: {
    channel: {
      type: Object as () => ChatInterface,
      required: true,
    },
    full: {
      type: String as PropType<CardSize>,
      default: "full",
    },
    size: {
      type: String as PropType<Size>,
      default: "medium",
    },
  },
  methods: {
    converse() {
      this.$router.push({
        name: "channel",
        params: {
          id: this.channel.id,
        },
      });
    },
  },
});
</script>

<style lang="scss">
.channel-card {
  position: relative;
  grid-gap: 0;

  &__acronyme {
      font-size: 2rem;
      font-weight: bold;
      color: var(--white-color);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }

  &.active {
    z-index: 2;

    .channel-card__details {
      margin: 0.2rem 0 auto;
      
      .name {
        font-size: 1rem;
      }
    }
  }
  
  &.full-card {
    grid-template-columns: 1fr 2fr;
    align-items: center;
  }

  &.half-card {
    grid-template-columns: 1fr;

    .channel-card__details {
      display: none;
    }
  }

  &__avatar {
    width: 50px;
    height: 50px;
    overflow: hidden;
    position: relative;
    border-radius: 50%;
    background-color: var(--primary-color);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    &.small {
      width: 30px;
      height: 30px;
    }

    &.medium {
      width: 50px;
      height: 50px;
    }

    &.large {
      width: 100px;
      height: 100px;

      .user-card__status {
        width: 20px;
        height: 20px;
        right: 5px;
        bottom: 5px;
      }
    }
  }

  &__details {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 0 10px;
    transition: all 0.2s ease-in-out;

    .name {
      font-size: 1rem;
      text-align: left;
      margin: 0;
			display: inline-block;
    }
  }
}

</style>

