<template>
  <div class="main-layout">
    <Header />
    <slot></slot>
    <Sidebar>
      <UsersList title="Utilisateurs en ligne" v-if="isLayout"/>
      <MembersList title="Membres" v-else/>
    </Sidebar>
  </div>
</template>

<script lang="ts">
import Header from "@/components/layout/header/Header.vue";
import Sidebar from "@/components/layout/sidebar/Sidebar.vue";
import UsersList from "@/components/user/UsersList.vue";
import MembersList from "@/components/user/MembersList.vue";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "ChannelLayout",
  components: {
    Header,
    Sidebar,
    UsersList,
    MembersList,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
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
