<template>
  <MainLayout>
    <div id="two-factor">
      <div class="content-wrapper flex flex-col items-center">
        <button class="btn text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2" @click="generateQr">Generate QR</button>
        <div v-if="qrCode" class="flex flex-col items-center mt-4">
          <img class="h-48 w-48" :src="qrCode" alt="qrCode"/>
          <div class="flex justify-center mt-4">
            <!-- Use computed property to generate input fields -->
            <input
              v-for="(code, index) in confirmationCode"
              :key="index"
              class="h-8 w-8 rounded-md text-white shadow-lg focus:outline-none bg-gradient-to-br from-[#36373a] to-[#3d3f42] text-center mx-1"
              v-model="confirmationCode[index]"
              type="text"
              :maxlength="1"
              ref="codeRef(index)"
              required
            />
          </div>
          <button
            @click.prevent="confirm"
            class="btn text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4"
          >
            Confirm
          </button>
        </div>
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
      qrCode: null,
			confirmationCode: Array(6).fill(""),
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
		async confirm() {
			const input = this.confirmationCode.join("")
			console.log("Input Content:", input);
			axios.post(`${import.meta.env.VITE_APP_API_URL}/2fa/turn-on`,
				{ tfa_code: input },
        {
          withCredentials: true,
        }
      ).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error);
      });

		},
		codeRef(index) {
      return `code${index + 1}`;
    },
	}

});

</script>

<style scoped>
.confirmation-code {
  display: flex;
  justify-content: center;
}

.confirmation-code-box {
  width: 36px;
  height: 36px;
  background-color: #36373a;
  margin-right: 4px;
  border-radius: 4px;
}

.filled {
  background-color: #3d3f42;
}
</style>