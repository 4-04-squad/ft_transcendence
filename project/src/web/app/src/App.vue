<template>
  <div id="app">
    <AlertBanner />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import AlertBanner from "./components/ui/banner/AlertBanner.vue";
import { inject } from "vue";
import type { Socket } from "socket.io-client";
import { useUserStore } from "./stores/user";
import type { AlertInterface } from "./interfaces/alert.interface";
import { useAlertStore } from "./stores/alert";
const socket = inject('socket') as Socket;

const userStore = useUserStore();
const alertStore = useAlertStore();

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);

// set on resize
window.addEventListener("resize", () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});

socket.on("sendNotif", (data: any) => {
    if (userStore.user) {
      if (data.type == "game") {
        if (data.userId == userStore.user.id)
        {
          const alert = {
					status: 200,
					message: data.msg,
					link: data.linkId,
          socketType: data.type,
					timeout: 100000,
				} as AlertInterface;

				alertStore.setAlert(alert);
        }
			} else if (data.type == "chat") {
        if (data.userId == userStore.user.id) {
          const alert = {
            status: 200,
            message: data.msg,
            link: data.linkId,
            socketType: data.type,
            timeout: 100000,
				} as AlertInterface;

				alertStore.setAlert(alert);
        }
			}else if (data.type == "online") { 
        const alert = {
          status: 200,
          message: data.sender.id === userStore.user?.id ? "You are online" : `@${data.sender.pseudo} is online`,
        } as AlertInterface;

        alertStore.setAlert(alert);
      }
      else {
        const alert = {
          status: 200,
          message: data.msg,
        } as AlertInterface;
        alertStore.setAlert(alert);
      }
    }
  });

</script>

<style lang="scss">
:root {
  --vh: #{vh};
}
</style>
