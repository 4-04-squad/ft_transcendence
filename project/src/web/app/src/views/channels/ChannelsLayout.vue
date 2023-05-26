<template>
  <ChannelLayout>
    <div class="channels-layout main-page-content">
      <div class="channels-menu" v-if="isLayout">
        <ChannelLobby />
      </div>
      <div class="channels-layout__container" v-else>
        <div class="channels-layout__conversations">
          <ChannelList />
        </div>
        <div class="channels-layout__content">
          <router-view />
        </div>
      </div>
    </div>
  </ChannelLayout>
</template>

<script lang="ts">
import ChannelLayout from "@/components/layout/layout/ChannelLayout.vue";
import ChannelList from "@/components/channels/ChannelList.vue";
import ChannelLobby from "@/components/channels/ChannelLobby.vue";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "ChannelsLayout",
  components: {
    ChannelLayout,
    ChannelList,
    ChannelLobby,
  },
  setup() {

    // watch for route changes
    const route = useRoute();
    const isLayout = ref(true);

    if (route.params.id) {
      isLayout.value = false;
    } else {
      isLayout.value = true;
    }

    // if route contains a channel id, then we are in a channel
    watch(route, () => {
      if (route.params.id) {
        isLayout.value = false;
      } else {
        isLayout.value = true;
      }
    });


    return {
      isLayout
    };
  },
});
</script>

<style lang="scss">
.channels-layout {
  &__container {
    margin: var(--global-margin);
    display: grid;
    height: 100%;
    grid-template-columns: 1fr 3fr;
    grid-template-rows: 1fr;
    grid-template-areas:
      "list content";

    @media screen and (max-width: 768px) {
      grid-template-columns: 1fr;
      grid-template-areas:
      "list"
      "content";
    }
  }

  &__conversations {
      grid-area: list;
      max-width: 40vw;

      @media screen and (max-width: 768px) {
        max-width:92vw;
      }
    }

    &__content {
      grid-area: content;
    }

  .hero {
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .title {
      margin: 0;
      text-transform: uppercase;
    }
  }
}
</style>
