<template>
	<MainLayout>
		<div id="two-factor" class="main-page-content">
			<div class="content-wrapper flex flex-col items-center justify-center min-h-full">
				<button v-if="userStore.user.twofaenabled"
					class="btn text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
					@click="removeTfa">
					Remove 2FA
				</button>
				<button v-else-if="!userStore.user.twofaenabled && qrCode == null"
					class="btn text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
					@click="generateQr">
					Activate 2FA
				</button>
				<div v-if="qrCode" class="flex flex-col items-center mt-4">
					<img class="h-48 w-48" :src="qrCode" alt="qrCode" />
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
              @input="next"
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
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import type { UserInterface } from "@/interfaces/user.interface";
import { useAlertStore } from "@/stores/alert";
import type { AlertInterface } from "@/interfaces/alert.interface";

export default defineComponent({
	name: "TwoFactorView",
	components: {
		MainLayout
	},
	setup() {
		const userStore = useUserStore();
		const alertStore = useAlertStore();
    
		return {
			userStore,
			alertStore
		};
	},
	data() {
		return {
			qrCode: null,
			confirmationCode: Array(6).fill("")
		};
	},
	methods: {
		async generateQr() {
			axios.post(`${import.meta.env.VITE_APP_API_URL}/2fa/generate`,
				{
					withCredentials: true,
				}
			).then((response) => {
				this.qrCode = response.data.ret;
			});
		},
		async confirm() {
			const input = this.confirmationCode.join("")
			axios.post(`${import.meta.env.VITE_APP_API_URL}/2fa/turn-on`,
				{ tfa_code: input },
				{
					withCredentials: true,
				}).then((response) => {
					if (response.status === 206) {
						const alert = {
							status: 401,
							message: 'Code 2FA incorrect.',
						} as AlertInterface;

						this.alertStore.setAlert(alert);
					} else {
						this.userStore.setUser(response.data.user as UserInterface);
						this.qrCode = null;
					}
				});

		},
		codeRef(index: number) {
			return `code${index + 1}`;
		},
    next(e: any) {
      e.target?.nextElementSibling?.focus();
    },
		async removeTfa() {
			axios.post(`${import.meta.env.VITE_APP_API_URL}/2fa/turn-off`,
				{
					withCredentials: true,
				}
			).then((response) => {
				this.userStore.setUser(response.data.user as UserInterface);
			});
		}
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