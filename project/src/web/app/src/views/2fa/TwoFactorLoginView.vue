<template>
  <TwoFactorLayout>
    <div id="two-factor" class="main-page-content">
      <div class="content-wrapper flex flex-col items-center justify-center min-h-full">
				<div class="text-center">
          <h2 class="text-2xl font-bold mb-4">Please enter the 2FA code</h2>
				</div>
        <div class="flex flex-col items-center mt-4">
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
  </TwoFactorLayout>
</template>


<script lang="ts">
import TwoFactorLayout from "@/components/layout/layout/TwoFactorLayout.vue";
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import type { UserInterface } from "@/interfaces/user.interface";
import router from "@/router";

export default defineComponent({
	name: "TwoFactorLoginView",
	components: {
		TwoFactorLayout
	},
	setup() {
		const userStore = useUserStore();

		return {
			userStore
		};
	},
	data() {
		return {
			confirmationCode: Array(6).fill(""),
		};
	},
	methods: {

		async confirm() {
			const input = this.confirmationCode.join("")
			console.log("Input Content:", input);
			axios.post(`${import.meta.env.VITE_APP_API_URL}/2fa/authenticate`,
				{ tfa_code: input },
				{
					withCredentials: true,
					headers: {
						"Content-Type": "application/json",
					},
				}).then((response) => {
					console.log(response);
					this.userStore.setUser(response.data.user as UserInterface);
					if (this.userStore.user) {
						console.log("User is logged in " + this.userStore.user.pseudo);
						router.push({ path: "/" });
					}
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


<style lang="scss" scoped>

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
