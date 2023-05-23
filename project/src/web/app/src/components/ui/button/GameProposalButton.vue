<template>
  <button @click="gameProposal" :class="class">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { useUserStore } from "@/stores/user";
import { createGame, joinGame, getGamesByUser } from "@/services/gameServices";
import axios from "axios";
import router from "@/router";
import type { Socket } from "socket.io-client";

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

    const createGameAndNavigate = () => {
      createGame()
        .then((res) => {
					socket.emit("sendNotif", {userId: user, linkId: res.data.games.id});
          router.push({ name: "game", params: { id: res.data.games.id } });
        })
        .catch((err) => {
          console.log(err);
        });
    };

    const joinGameAndNavigate = (gameId: number) => {
      joinGame(gameId)
        .then((res) => {
					socket.emit("sendNotif", {userId: user, linkId: res.data.games.id});
          router.push({ name: "game", params: { id: res.data.games.id } });
        })
        .catch((err) => {
          console.log(err);
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
          console.log(err);
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
