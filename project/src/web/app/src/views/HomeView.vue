<template>
  <MainLayout>
    <div id="page-home" class="main-page-content">
      <div class="hero">
        <h1 class="title">
          Hello, <span>{{ userStore.user?.pseudo }}</span>
        </h1>
      </div>
      <div class="content-wrapper">
        <h2 class="title">Top classement</h2>
          <EasyDataTable :headers="headers" :items="items" :theme-color="'var(--primary-color)'"
              :buttons-pagination="true" empty-message="Aucun utilisateur trouvé" :rows-items="[10, 15, 20]" :rows-per-page="5"
              rows-per-page-message="Utilisateurs par page">
              <template #item-avatar="{ avatar, pseudo }">
                <RouterLink :to="{ name: 'user', params: { pseudo: pseudo } }">
                  <img class="avatar avatar--rounded medium" :src="avatar" :alt="pseudo" />
                </RouterLink>
              </template>
              <template #item-pseudo="{ pseudo }">
                <RouterLink :to="{ name: 'user', params: { pseudo: pseudo } }">
                  <span>{{ pseudo }}</span>
                </RouterLink>
              </template>
              <template #item-elo="{ elo }">
                <span :class="`status ${elo}`">{{ elo }}</span>
              </template>
              <template #item-status="{ status }">
                <span :class="`status ${status}`">{{ status }}</span>
              </template>
              <template #item-profile="{ profile, pseudo }">
                <ul class="btns">
                  <li>
                    <FriendRequestButton :friendId="profile" class="btn btn--icon only-icon" />
                  </li>
                  <li>
                    <RouterLink :to="{ name: 'user', params: { pseudo: pseudo } }">
                      <button class="btn btn--icon only-icon">
                        <ExternalLinkIcon />
                      </button>
                    </RouterLink>
                  </li>
                </ul>
              </template>
          </EasyDataTable>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts">
import MainLayout from "@/components/layout/layout/MainLayout.vue";
import { defineComponent, inject, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import EasyDataTable from "vue3-easy-data-table";
import router from "@/router";
import type { UserInterface } from "@/interfaces/user.interface";
import type { Header, Item } from "vue3-easy-data-table";
import axios from "axios";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
import type { Socket } from "socket.io-client";

export default defineComponent({
  name: "HomeView",
  components: {
    MainLayout,
    EasyDataTable,
  },
  setup() {
    const alertStore = useAlertStore();
    const userStore = useUserStore()
    const users = ref([] as UserInterface[]);
    const headers = [
      { text: "TOP", value: "index", sortable: true },
      { text: "ELO", value: "elo", sortable: true },
      { text: "AVATAR", value: "avatar", sortable: false },
      { text: "PSEUDO", value: "pseudo" },
      { text: "STATUS", value: "status"},
      { text: "", value: "profile" },
    ] as Header[];
    const items = ref([] as Item[]);
    const updatedAt = ref("");
    const socket = inject('socket') as Socket;

    socket.on("userStatus", (data: any) => {
        updatedAt.value = data.updatedAt;
    });

    // Watch user status to fetch
    watch(updatedAt, () => {
      axios
      .get(`${import.meta.env.VITE_APP_API_URL}/users`, {
        withCredentials: true,
      })
      .then((response) => {
        users.value = response.data.users;
        users.value.sort((a, b) => {
          return b.elo - a.elo;
        });
        items.value = users.value.map((user, index) => ({
          avatar: user.avatar,
          pseudo: user.pseudo,
          email: user.email,
          elo: user.elo,
          status: user.status ? user.status.toLowerCase() : "",
          profile: user.id,
          index: index + 1,
        })) as Item[];
      })
      .catch((error) => {
        const alert = {
          status: error.response.data.statusCode,
          message: error.response.data.message,
        } as AlertInterface;
        alertStore.setAlert(alert);
        if (axios.isAxiosError(error)) {
          if (error.response?.status == 401) {
            router.push({ path: "/login" });
          }
        }
      });
    });

    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/users`, {
        withCredentials: true,
      })
      .then((response) => {
        users.value = response.data.users;
        users.value.sort((a, b) => {
          return b.elo - a.elo;
        });
        items.value = users.value.map((user, index) => ({
          avatar: user.avatar,
          pseudo: user.pseudo,
          email: user.email,
          elo: user.elo,
          status: user.status ? user.status.toLowerCase() : "",
          profile: user.id,
          index: index + 1,
        })) as Item[];
      })
      .catch((error) => {
        const alert = {
          status: error.response.data.statusCode,
          message: error.response.data.message,
        } as AlertInterface;
        alertStore.setAlert(alert);
        if (axios.isAxiosError(error)) {
          if (error.response?.status == 401) {
            router.push({ path: "/login" });
          }
        }
      });

    return {
      userStore,
      headers,
      items,
    };
  },
});
</script>

<style lang="scss">
#page-home {
  .content-wrapper {
    max-height: 55vh;
    height: 55vh;
    overflow-y: hidden;

    .title {
      font-size: 1.2rem;
      font-weight: bold;
      text-align: center;
      margin-bottom: 1rem;
    }

    @media (max-width: var(--tablet)) {
      overflow-y: scroll;
    }

    @media (max-width: var(--small)) {
      max-height: 55vh;
      height: 55vh;
    }
  }

}
</style>
