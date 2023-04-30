<template>
	<h2 class="users-list__title">{{ title }}</h2>
	<div :class="`users-list users-list--${game}`">
	  <div
		class="users-list__item"
		v-for="player in players"
		:key="player.id"
		v-if="players.length"
	  >
		<UserCard :user="player" :full="'full'" />
	  </div>
	  <p class="users-list__message" v-else>Aucun membres</p>
	</div>
  </template>
  
  <script lang="ts">
  import type { UserInterface } from "@/interfaces/user.interface";
  import { getGameById } from "@/services/gameServices";
  import { defineComponent, ref, watch } from "vue";
  import UserCard from "./UserCard.vue";
  import axios from "axios";
  import { useRoute } from "vue-router";
  
  export default defineComponent({
	name: "PlayersList",
	components: { UserCard },
	props: {
	  title: {
		type: String,
		default: "Players",
	  },
	  game: {
		type: String,
		default: "",
	  },
	},
	setup(props) {
	  const route = useRoute();
	  const players = ref([] as UserInterface[]);
	  watch(
		() => route.params,
		async () => {
		  if (route.params.id) {
			getGameById(route.params.id).then((data) => {
			  players.value = data.data.games.users;
			});
		  }
		},
		{ immediate: true } // Call the function immediately when the component is created
	  );
  
	  return {
		players
	  };
	},
  });
  </script>
  
  <style lang="scss">
  .users-list {
	&__title {
	  font-size: 1.5rem;
	  font-weight: 600;
	  margin-bottom: 1rem;
	}
  
	&__message {
	  text-align: center;
	}
  
	&__item {
	  margin-bottom: 1rem;
  
	  .user-card {
		grid-gap: 0;
		background-color: var(--border-color);
		border-radius: var(--radius);
  
		&__avatar {
		  padding: 0.2rem;
		}
	  }
	}
  }
  </style>
  