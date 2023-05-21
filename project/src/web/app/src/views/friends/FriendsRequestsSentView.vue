<template>
  <div id="page-friends">
    <div class="head">
      <h1 class="title title--search">
        <span> Rechercher un.e ami.e </span>
        <div class="search search--icon">
          <SearchIcon />
          <input type="text" v-model="searchValue" placeholder="Rechercher" />
          <UsersFilters />
        </div>
      </h1>
    </div>
    <EasyDataTable
      :headers="headers"
      :items="items"
      :theme-color="'var(--primary-color)'"
      :search-value="searchValue"
      :buttons-pagination="true"
      empty-message="Aucun ami.e.s trouvé"
      :rows-items="[10, 15, 20]"
      :rows-per-page="5"
      rows-per-page-message="Ami.e.s par page"
    >
      <template #item-avatar="{ avatar, pseudo }">
        <RouterLink :to="{ name: 'user', params: { pseudo: pseudo } }">
          <img
            class="avatar avatar--rounded medium"
            :src="avatar"
            :alt="pseudo"
          />
        </RouterLink>
      </template>
      <template #item-pseudo="{ pseudo }">
        <RouterLink :to="{ name: 'user', params: { pseudo: pseudo } }">
          <span>{{ pseudo }}</span>
        </RouterLink>
      </template>
      <template #item-email="{ email }">
        <span>{{ email }}</span>
      </template>
      <template #item-status="{ status }">
        <span :class="`status ${status}`">{{ status }}</span>
      </template>
      <template #item-profile="{ profile, pseudo }">
        <ul class="btns">
          <li>
            <FriendRequestButton
              :friendId="profile"
              class="btn btn--icon only-icon"
            />
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
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { RouterLink } from "vue-router";
import axios from "axios";
import router from "@/router";
import type { Header, Item } from "vue3-easy-data-table";
import EasyDataTable from "vue3-easy-data-table";
import type { UserInterface } from "@/interfaces/user.interface";
import { SearchIcon, ExternalLinkIcon } from "@/components/icons";
import UserCard from "@/components/user/UserCard.vue";
import FriendRequestButton from "@/components/ui/button/FriendRequestButton.vue";
import UsersFilters from "@/components/user/UsersFilters.vue";

export default defineComponent({
  name: "FriendsRequestsSentView",
  components: {
    EasyDataTable,
    SearchIcon,
    ExternalLinkIcon,
    FriendRequestButton,
    UserCard,
    UsersFilters,
  },
  setup() {
    const searchValue = ref("");

    const users = ref([] as UserInterface[]);
    const headers = [
      { text: "AVATAR", value: "avatar", sortable: false },
      { text: "PSEUDO", value: "pseudo" },
      { text: "EMAIL", value: "email" },
      { text: "STATUS", value: "status", sortable: true },
      { text: "", value: "profile" },
    ] as Header[];
    const items = ref([] as Item[]);

    const response = axios
      .get(`${import.meta.env.VITE_APP_API_URL}/friends/requests`, {
        withCredentials: true,
      })
      .then((response) => {
        users.value = response.data.friendRequests.map(
          (friendRequest: any) => friendRequest.friend
        );
        items.value = users.value.map((user) => ({
          avatar: user.avatar,
          pseudo: user.pseudo,
          email: user.email,
          status: user.status ? user.status.toLowerCase() : "",
          profile: user.id,
        })) as Item[];
      })
      .catch((error) => {
        console.log(error);
        if (axios.isAxiosError(error)) {
          console.log(error.response?.data);
          if (error.response?.status == 401) {
            router.push({ path: "/login" });
          }
        }
      });

    return {
      searchValue,
      headers,
      items,
    };
  },
});
</script>

<style lang="scss">
#page-friends {
  .friends-items {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
