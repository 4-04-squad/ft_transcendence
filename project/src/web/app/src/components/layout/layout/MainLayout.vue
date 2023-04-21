<template>
  <div class="main-layout">
    <Header />
    <slot></slot>
    <Sidebar>
      <UsersList title="Utilisateurs en ligne" />
    </Sidebar>
  </div>
</template>

<script lang="ts">
import Header from "@/components/layout/header/Header.vue";
import Sidebar from "@/components/layout/sidebar/Sidebar.vue";
import UsersList from "@/components/user/UsersList.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "MainLayout",
  components: {
    Header,
    Sidebar,
    UsersList,
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
});
</script>
