<template>
  <h2 class="channels-list__title">{{ title }}</h2>
  <div class="channels-list">
    <div class="channels-list__item" v-for="channel in channels" :key="channel.id" v-if="channels.length">
      <ChannelCard
        :channel="channel"
        @selectChannel="handleChannelSelection"
      />
    </div>
    <p class="channels-list__message" v-else>Aucun channel trouvé</p>
  </div>
</template>

<script lang="ts">
import type { ChatInterface } from "@/interfaces/chat.interface";
import { defineComponent, ref } from "vue";
import ChannelCard from "./ChannelCard.vue";
import axios from "axios";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
  name: "ChannelsList",
  components: { ChannelCard },
  props: {
    title: {
      type: String,
      default: "Channels",
    },
  },
  setup() {
	  const alertStore = useAlertStore();
    const channels = ref([] as ChatInterface[]);
    const selectedChannels = ref(null as ChatInterface | null);

    const handleChannelSelection = (channel: ChatInterface) => {
      selectedChannels.value = channel;
    };


    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/channels/@me`, {
        withCredentials: true,
      })
      .then((response) => {
        channels.value = response.data.channels;
      })
      .catch((error) => {
        const alert = {
          status: error.response.data.statusCode,
          message: error.response.data.message,
        } as AlertInterface;

        alertStore.setAlert(alert);
      });

    return {
      channels,
      selectedChannels,
      handleChannelSelection,
    };
  },
});
</script>

<style lang="scss">
.channels-list {
  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  &__item {
    margin-bottom: 1rem;
    overflow-y: auto;

    @media screen and (max-width: 768px) {
      margin-bottom: 0;
      width: 100%;
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
    }
  }

  .channel-card {
      @media screen and (max-width: 768px) {
        margin-right: 1rem;
      }
    }
}
</style>