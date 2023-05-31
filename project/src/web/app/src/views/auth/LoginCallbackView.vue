<template>
    <div v-if="loading" class="loading-container">
        <div class="loading"></div>
        <p>Logging in...</p>
  </div>
</template>
  
<script lang="ts">
import BasicLayout from "@/components/layout/layout/BasicLayout.vue";
import type { AlertInterface } from "@/interfaces/alert.interface";
import type { UserInterface } from "@/interfaces/user.interface";
import router from "@/router";
import { useAlertStore } from "@/stores/alert";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import type { Socket } from "socket.io-client";
import { defineComponent, inject } from "vue";

export default defineComponent({
    name: "LoginCallbackView",
    components: {
        BasicLayout,
    },
    data() {
    return {
      loading: true
    }
  },
    setup() {
        const userStore = useUserStore();
        const alertStore = useAlertStore();
        // detect if url has code=
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const socket = inject("socket") as Socket;

        if (code) {
            const loginUrl = `${import.meta.env.VITE_APP_API_URL}/auth/login/callback`;
            const response = axios.post(
                loginUrl,
                {
                    code,
                },
                {
                    withCredentials: true,
                }
            ).then((response) => {
                if (response.status === 206) {
                    const alert = {
                        status: response.status,
                        message: "2Fa is enabled",
                    } as AlertInterface;
                    alertStore.setAlert(alert);
                    router.push({ path: "/login_2fa" });
                }
                else if (response.status === 200) {
                    // clear the interval and close the popup
                    const alert = {
                        status: response.status,
                        message: "Successfully logged in",
                    } as AlertInterface;
                    alertStore.setAlert(alert);
                    // set the user in the store
                    userStore.setUser(response.data.user as UserInterface);
                    if (userStore.user) {
                        socket.emit("joinOnline", {user: userStore.user});
                        if (response.data.redirect === "user-edit")
                            router.push({ name: "user-edit", params: { id: userStore.user.id } });
                        else
                            router.push({ path: "/profile" });
                    }
                }
            }).catch((error) => {
                const alert = {
                    status: error.response.status,
                    message: error.response.data.message,
                } as AlertInterface;
                alertStore.setAlert(alert);
            });
        }
    }
});
</script>
  
<style scoped lang="scss">
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-transform: uppercase;
    font-weight: bold;

    .loading {
        border: 16px solid var(--border-color);
        border-radius: 50%;
        border-top: 16px solid var(--primary-color);
        width: 120px;
        height: 120px;
        animation: spin 2s linear infinite;
        margin-bottom: 1rem;

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    }
}
</style>