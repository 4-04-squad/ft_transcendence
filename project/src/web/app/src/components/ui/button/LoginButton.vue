<template>
  <button @click="login" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent} from "vue";

export default defineComponent({
  name: "LoginButton",
  props: {
    class: {
      type: String,
      default: "",
    },
  },
  methods: {
    async login() {
      const token = import.meta.env.VITE_APP_FORTY_TWO_CLIENT_ID;
      const callbackUrl = `${
        import.meta.env.VITE_APP_WEB_URL
      }/login/callback`;
      const redirectUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${token}&redirect_uri=${callbackUrl}&response_type=code`;
      
      window.location.href = redirectUrl;
    },
  },
});
</script>
