<template>
  <MainLayout>
    <div class="chats-layout main-page-content">
      <div class="chat-menu" v-if="isLayout">
        <ChatLobby />
      </div>
      <div class="chats-layout__container" v-else>
        <div class="chats-layout__conversations">
          <ChatsList />
        </div>
        <div class="chats-layout__content">
          <router-view />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts">
import ChatsList from "@/components/chats/ChatsList.vue";
import MainLayout from "@/components/layout/layout/MainLayout.vue";
import ChatLobby from "@/components/chats/ChatLobby.vue";
import { defineComponent, watch, ref } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "ChatsLayout",
  components: {
    MainLayout,
    ChatsList,
    ChatLobby,
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

    // if route contains a chat id, then we are in a chat
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
.chats-layout {
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
      max-width: calc(var(--vh) * 40);
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
