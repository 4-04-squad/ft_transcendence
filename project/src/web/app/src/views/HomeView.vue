<template>
  <MainLayout>
    <div id="page-home" class="main-page-content">
      <div class="hero">
        <h1 class="title">
          Hello, <span>{{ userStore.user?.pseudo }}</span>
        </h1>
        <button class="btn" @click="generateQr">2FA</button>
        <img class="h-48 w-48" :src="qrCode"/>
      </div>
      <div class="content-wrapper">
        <div class="grid">
          <div class="home-card">
            <h2 class="title">Shortcut</h2>
          </div>
          <div class="home-card">
            <h2 class="title">Top classement</h2>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts">
import MainLayout from "@/components/layout/layout/MainLayout.vue";
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import router from "@/router";
import axios from "axios";

export default defineComponent({
  name: "HomeView",
  components: {
    MainLayout,
  },
  setup() {
    const userStore = useUserStore();
    const qrCode = null;

    return {
      userStore,
      qrCode
    };
  },
  methods: {
    async generateQr() {
      console.log("2fa");

      axios.post(`${import.meta.env.VITE_APP_API_URL}/2fa/generate`,
        {
          withCredentials: true,
        }
      ).then((response) => {
        console.log(response);
        
        this.qrCode = response.data;

        // let blob = new Blob([response.data], { type: 'image/png' });
        // console.log(blob);
        // let url = URL.createObjectURL(blob);
        // this.qrCode = url.slice(5);
        // console.log(this.qrCode);
      }).catch((error) => {
        console.log(error);
      });
    },
  }
});
</script>

<style lang="scss">
#page-home {
  .content-wrapper {
    max-height: 55vh;
    height: 55vh;
    overflow-y: hidden;

    @media (max-width: var(--tablet)) {
      overflow-y: scroll;
    }

    @media (max-width: var(--small)) {
      max-height: 55vh;
      height: 55vh;
    }
  }

  .home-card {
    background-color: var(--border-color);
    padding: var(--spacing);
    border-radius: var(--radius-sm);
    height: 100%;

    .title {
      font-size: 1.2rem;
      font-weight: bold;
    }
  }
}
</style>
