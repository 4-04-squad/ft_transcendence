<template>
	<form class="form flex flex-col items-center">
		<input :class="[inputClass]" placeholder="Username" id="Email" ref="pseudo" required />
		<input :class="[inputClass]" type="password" placeholder="Password" id="Password" ref="password" required />
		<button @click.prevent="signin"
			class="btn text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
			id="submit">
			Login
		</button>
	</form>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import type { UserInterface } from "@/interfaces/user.interface";
import router from "@/router";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
import type { Socket } from "socket.io-client";

export default defineComponent({
	name: "LoginForm",
	setup() {
		const inputClass = "rounded-md p-2 mb-3 text-white shadow-lg focus:outline-none bg-gradient-to-br from-[#36373a] to-[#3d3f42]"
		const userStore = useUserStore();
		const alertStore = useAlertStore();
		const socket = inject('socket') as Socket;

		return {
			inputClass,
			userStore,
			alertStore,
			socket
		};
	},
	methods: {
		async signin() {
			const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/signin`,
				{
					pseudo: (this.$refs.pseudo as any).value,
					password: (this.$refs.password as any).value
				},
				{
					withCredentials: true,
					headers: {
						"Content-Type": "application/json",
					},
				}
			).then((res) => {
				if (res.status === 206) {
					router.push({ path: "/login_2fa" });
				} else {
					this.userStore.setUser(res.data.user as UserInterface);
					if (this.userStore.user) {
						this.socket.emit("joinOnline", { user: this.userStore.user });
						if (this.userStore.user.createdAt === this.userStore.user.updatedAt) {
							router.push({ path: `/users/${this.userStore.user.id}/edit`});
						}
						else {
							router.push({ path: "/" });
						}
					}
				}
			})
			.catch((err) => {
				const alert = {
						status: 401,
						message: 'Mot de passe incorrect.',
					} as AlertInterface;

					this.alertStore.setAlert(alert);
			})
		}
	}
});
</script>