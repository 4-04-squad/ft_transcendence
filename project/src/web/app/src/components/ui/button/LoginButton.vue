<template>
  <button @click="login" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import router from "@/router";
import type { UserInterface } from "@/interfaces/user.interface";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
import type { Socket } from "socket.io-client";

export default defineComponent({
  name: "LoginButton",
  props: {
    class: {
      type: String,
      default: "",
    },
  },
  setup() {
    const userStore = useUserStore();
    const alertStore = useAlertStore();
    const socket = inject('socket') as Socket;

    socket.on('shoutOnline', (data: any) => {
      console.log(data);
			const alert = {
				status: 200,
				message: data.msg,
			} as AlertInterface;

			alertStore.setAlert(alert);
		});

    return {
      userStore,
      alertStore,
      socket
    };
  },
  methods: {
    async login() {
      const loading = ref(0);
      const loginUrl = `${import.meta.env.VITE_APP_API_URL}/users/@me`;
      const token = import.meta.env.VITE_APP_FORTY_TWO_CLIENT_ID;
      const callbackUrl = `${
        import.meta.env.VITE_APP_API_URL
      }/auth/login/callback`;
      const redirectUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${token}&redirect_uri=${callbackUrl}&response_type=code`;
      
      const logUser = async () => {
        await axios.get(loginUrl, {
            withCredentials: true,
          }).then((response) => {
          // check if the user is logged in
          if (response.status === 206) {
						router.push({ path: "/login_2fa" });
					}
          else if (response.status === 200) {
            // set the default image
            if (!response.data.user.avatar) {
              axios.patch(
                  `${import.meta.env.VITE_APP_API_URL}/users/${response.data.user.id}/edit`,
                  {
                    avatar: "/public/img/marvin.png"
                  },
                  {
                    withCredentials: true,
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
            }
            // set the user in the store
            this.userStore.setUser(response.data.user as UserInterface);
            this.socket.emit("joinOnline", { user: this.userStore.user });
            if (this.userStore.user) {
              if (this.userStore.user.createdAt === this.userStore.user.updatedAt) {
                router.push({ path: `/users/${this.userStore.user.id}/edit`});
              }
              else {
                console.log("User is logged in " + this.userStore.user.pseudo);
                router.push({ path: "/" });
              }
            }
          }
          })
          .catch((error) => {
            const alert = {
            status: error.response.data.statusCode,
            message: error.response.data.message,
          } as AlertInterface;
          this.alertStore.setAlert(alert);
          });
      }

        const popup = window.open(redirectUrl, "_blank", "height=600,width=600");
        popup?.addEventListener("load", () => {
          setTimeout(function(){
            if (popup?.location.href === loginUrl && loading.value === 0) {
              loading.value = 1;
            } else {
              loading.value = 0;
            }
          }, 100);
          logUser();
          popup?.close();
        });

    },
  },
});
</script>
