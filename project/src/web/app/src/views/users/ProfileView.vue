<template>
  <div id="page-profile" class="page-user">
    <div class="head">
      <div class="action-friend" v-if="user && user?.id !== userStore.user?.id">
        <FriendRequestButton
          :class="'btn btn--icon no-bg'"
          :friendId="user?.id"
        />
        <BlockUserButton
          :friendId="user?.id"
          :class="'btn btn--icon no-bg'"
      />
      </div>
      <UserCard :user="user" :full="'full'" :size="'large'" />
      <div class="shortcut" v-if="user?.id === userStore.user?.id">
        <RouterLink
          :to="{ name: 'user-edit', params: { id: user?.id } }"
          class="edit-btn"
        >
          <button class="btn btn--icon no-bg">
            <EditIcon />
            <span>Modifier mon profil</span>
          </button>
        </RouterLink>
      </div>
    </div>
    <div class="content-wrapper content-wrapper--user">
      <EasyDataTable :headers="headers" :items="items" :theme-color="'var(--primary-color)'" :buttons-pagination="true"
        empty-message="Aucun history game trouvé" :rows-items="[10, 15, 20]" :rows-per-page="5"
        rows-per-page-message="Games par page">
        <template #item-id="{ id, status }">
            <RouterLink :to="{ name: 'game', params: { id: id } }" v-if="status != 'FINISHED'">
                <span>Game <span class="game-name">#{{ id }}</span></span>
            </RouterLink>
            <span v-else>Game <span class="game-name not-allowed">#{{ id }}</span></span>
        </template>
        <template #item-status="{ status }">
            <span :class="`game-status game-status--${status.toLowerCase()}`">{{ status.toLowerCase() }}</span>
        </template>
        <template #item-players="{ players }">
            <div class="players">
                <div class="players__item" v-for="player in players" :key="player.id">
                    <RouterLink :to="{ name: 'user', params: { pseudo: player.pseudo } }">
                        <img class="avatar avatar--rounded small" :src="player.avatar" :alt="player.pseudo" />
                    </RouterLink>
                </div>
            </div>
        </template>
      </EasyDataTable>
      <div v-if="userStats?.userGamesStatistics" class="user-stats-container">
          <DoughutChartCard
            title="Win / Lose games"
            :labels="['win', 'lose']"
            :gamesData="[
              userStats?.userGamesStatistics.totalWins,
              userStats?.userGamesStatistics.totalLoses,
            ]"
          />
          <BarChartCard
            title="Average Score"
            :labels="['Player Average Score', 'Average Score']"
            :gamesData="[
              userStats?.userGamesStatistics.averageScore,
              userStats?.allGamesStatistics.averageScore,
            ]"
          />
          <BarChartCard
            title="Average Elo"
            :labels="['Your elo', 'Average elo']"
            :gamesData="[
              userStats?.userGamesStatistics.elo,
              userStats?.allGamesStatistics.elo,
            ]"
          />
          <BarChartCard
            title="Average experience"
            :labels="['Your xp', 'Average xp']"
            :gamesData="[
              userStats?.userGamesStatistics.experience,
              userStats?.allGamesStatistics.experience,
            ]"
          />
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import type { UserInterface } from "@/interfaces/user.interface";
import type { GameInterface, IUserStats } from "@/interfaces/game.interface";
import { useUserStore } from "@/stores/user";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import UserCard from "@/components/user/UserCard.vue";
import FriendRequestButton from "@/components/ui/button/FriendRequestButton.vue";
import DoughutChartCard from "@/components/ui/chart/DoughutChartCard.vue";
import BarChartCard from "@/components/ui/chart/BarChartCard.vue";
import LineChartCard from "@/components/ui/chart/LineChartCard.vue";
import EasyDataTable, { type Header, type Item } from "vue3-easy-data-table";

import { EditIcon } from "@/components/icons";
import { getGames, getStatsByUser } from "@/services/gameServices";
import BlockUserButton from "@/components/ui/button/BlockUserButton.vue";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
import router from "@/router";

export default defineComponent({
  name: "ProfileView",
  components: {
    EasyDataTable,
    UserCard,
    EditIcon,
    FriendRequestButton,
    DoughutChartCard,
    BarChartCard,
    LineChartCard,
    BlockUserButton,
  },
  setup() {
    const alertStore = useAlertStore();
    const userStore = useUserStore();
    const route = useRoute();
    const user = ref<UserInterface | undefined>(undefined);
    const userStats = ref<IUserStats | undefined>(undefined);
    const games = ref([] as GameInterface[]);
    const headers = [
            { text: "ID", value: "id", sortable: true },
            { text: "USERS", value: "players" },
            { text: "STATUS", value: "status", sortable: true },
            { text: "RESULT", value: "result"},
            { text: "DATE", value: "date", sortable: true},
            { text: "", value: "game" } // game id
        ] as Header[];
    const items = ref([] as Item[]);

    getGames().then((response) => {
            games.value = response.data.games;
            games.value = games.value.filter((game) => {
              if (game.status === "FINISHED") {
                return game;
              }
            });
            items.value = games.value.map((game) => {
                return {
                    id: game.id,
                    players: game.users,
                    status: game.status,
                    result: game.userGames? game.userGames.find((userGame) => userGame.userId === userStore.user?.id)?.status: "",
                    date: game.updatedAt,
                } as Item;
            });
        })
            .catch((error) => {
                const alert = {
                    status: error.response.data.statusCode,
                    message: error.response.data.message,
                } as AlertInterface;

                alertStore.setAlert(alert);
        });


    // Watch for changes to route params and fetch user data again
    watch(
      () => route.params,
      async () => {
        if (route.params.pseudo) {
          // Get user by pseudo from API if we are on another user profile
          const response = await axios
            .get(
              `${import.meta.env.VITE_APP_API_URL}/users/${
                route.params.pseudo
              }`,
              {
                withCredentials: true,
              }
            )
            .then((response) => {
              user.value = response.data.user;
            })
            .catch((error) => {
              
            });
        } else {
          // Get current user from store
          user.value = userStore.user;
        }
      },
      { immediate: true } // Call the function immediately when the component is created
    );

    // fatch settings data when user is set
    watch(
      () => user.value,
      async (newVal, oldVal) => {
        if (!newVal) return;
        const data = await getStatsByUser(newVal.id);
        userStats.value = data.data.statistics;
      },
      { immediate: true } // Call the function immediately when the component is created
    );

    return {
      headers,
      items,
      userStore,
      user,
      userStats,
    };
  },
});
</script>

<style lang="scss">
.user-stats-container {
  display: grid;
  flex-direction: row;
  margin-top: 3rem;
  margin-bottom: 2rem;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
}

@media (max-width: 1024px) {
  .user-stats-container {
    grid-template-columns: 1fr;
  }
}

</style>
