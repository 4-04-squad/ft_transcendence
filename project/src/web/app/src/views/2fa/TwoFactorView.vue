<template>
	<MainLayout>
		<div id="two-factor">
			<div class="content-wrapper">
				<button class="btn" @click="generateQr">Generate QR</button>
				<img class="h-48 w-48" v-if="qrCode" :src="qrCode" alt="qrCode"/>
			</div>
		</div>
	</MainLayout>
</template>

<script lang="ts">
import MainLayout from "@/components/layout/layout/MainLayout.vue";
import { defineComponent  } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";

export default defineComponent({
  name: "TwoFactorView",
  components: {
    MainLayout
  },
  setup() {
    const userStore = useUserStore();

    return {
      userStore
    };
  },
  data() {
    return {
      qrCode: null
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
        this.qrCode = response.data.ret;
        console.log(this.qrCode);
      }).catch((error) => {
        console.log(error);
      });
    },
  }
});
</script>