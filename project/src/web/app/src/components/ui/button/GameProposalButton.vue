<template>
  <button @click="gameProposal" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { createGame, joinGame, getGamesByUser } from "@/services/gameServices";
import type { IGameSettings } from "@/interfaces/game.interface";
import axios from "axios";
import router from "@/router";
import type { Socket } from "socket.io-client";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
  name: "GameProposalButton",
  props: {
      class: {
        type: String,
        default: "",
      },
      user: {
        type: String,
        default: "",
        required: true,
      },
    },
  setup(props) {
    const userStore = useUserStore();
    const user = props.user;
		const socket = inject('socket') as Socket;
		const alertStore = useAlertStore();
    const updatedAt = ref("");
    const defaultGameSettings: IGameSettings = {
      gameId: '0',
      ballSpeed: 8,
      paddleSpeed: 20,
      ballColor: "#ffffff",
      backgroundColor: "#36373a",
      ballSize: 20,
      paddleSize: 75,
      paddleColor: "#ffffff",
      scoreLimit: 10,
    };

    const createGameAndNavigate = () => {
      createGame(defaultGameSettings)
        .then((res) => {
					socket.emit("sendNotif", {userId: user, linkId: res.data.game.id, sender: userStore.user, msg: "Invited to pong duel. Click to join !", type: "game"});
          router.push({ name: "game", params: { id: res.data.game.id } });
          updatedAt.value = new Date().toISOString();
          socket.emit('createGame', {updatedAt: updatedAt});
        })
        .catch((err) => {
			const alert = {
				status: err.response.status,
				message: err.response.data.message,
			} as AlertInterface;

			alertStore.setAlert(alert);
        });
    };

    const joinGameAndNavigate = (gameId: string) => {
      joinGame(gameId)
        .then((res) => {
					socket.emit("sendNotif", {userId: user, linkId: res.data.games.id, sender: userStore.user, msg: "Invited to pong duel. Click to join !", type: "game"});
          router.push({ name: "game", params: { id: res.data.games.id } });
        })
        .catch((err) => {
					const alert = {
						status: err.response.status,
						message: err.response.data.message,
					} as AlertInterface;

					alertStore.setAlert(alert);
        });
    };

    const gameProposal = () => {
      getGamesByUser(user)
        .then((res) => {
          const waiting_games = res.data.games.filter((game: any) => game.status === 'WAITING');
          if (waiting_games.length > 0) {
            joinGameAndNavigate(waiting_games[0].id);
          } else {
            createGameAndNavigate();
          }
        })
        .catch((err) => {
					const alert = {
						status: err.response.status,
						message: err.response.data.message,
					} as AlertInterface;

					alertStore.setAlert(alert);
        });
    };
 
    return {
      userStore,
      createGameAndNavigate,
      joinGameAndNavigate,
      gameProposal,
			socket: socket,
    };
  },
});
</script>
