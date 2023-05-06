<template>
  <div id="page-profile" class="page-user">
    <div class="head">
      <div class="action-friend" v-if="user && user?.id !== userStore.user?.id">
        <FriendRequestButton
          :class="'btn btn--icon no-bg'"
          :friendId="user?.id"
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
      <div class="user-stats-container">
        <DoughutChartCard title="Win / Lose games"/>
        <BarChartCard title="Average number of games" />
        <LineChartCard title="Average winrate" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { UserInterface } from "@/interfaces/user.interface";
import type { IUserStats } from "@/interfaces/game.interface";
import { useUserStore } from "@/stores/user";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import UserCard from "@/components/user/UserCard.vue";
import FriendRequestButton from "@/components/ui/button/FriendRequestButton.vue";
import DoughutChartCard from "@/components/ui/chart/DoughutChartCard.vue";
import BarChartCard from "@/components/ui/chart/BarChartCard.vue";
import LineChartCard from "@/components/ui/chart/LineChartCard.vue";

import { EditIcon } from "@/components/icons";
import { getStatsByUser } from "@/services/gameServices";

export default defineComponent({
  name: "ProfileView",
  components: {
    UserCard,
    EditIcon,
    FriendRequestButton,
    DoughutChartCard,
    BarChartCard,
    LineChartCard,
  },
  setup() {
    const userStore = useUserStore();
    const route = useRoute();
    const user = ref<UserInterface | undefined>(undefined);
    const userStats = ref<IUserStats | undefined>(undefined);
    // Watch for changes to route params and fetch user data again
    const chartData = {
      labels: ["Loosing", "Winning"],
      datasets: [
        {
          backgroundColor: ["#FF6384", "#36A2EB"],
          data: [20, 80],
        },
      ],
    };

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
              console.log(error);
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
        console.log(
          "userStats",
          userStats.value?.allGamesStatistics,
          userStats.value?.userGamesStatistics
        );
      },
      { immediate: true } // Call the function immediately when the component is created
    );

    return {
      userStore,
      user,
      chartData,
    };
  },
});
</script>

<style lang="scss">
.user-stats-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-top: 3rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .user-stats-container {
    flex-direction: column;
  }
}
</style>
