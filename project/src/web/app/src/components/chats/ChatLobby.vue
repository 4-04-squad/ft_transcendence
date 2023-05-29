<template>
    <div class="head">
        <h1 class="title title--search">
            <span> Rechercher un chat</span>
            <div class="search search--icon">
                <SearchIcon />
                <input type="text" v-model="searchValue" placeholder="Rechercher" />
            </div>
        </h1>
    </div>
    <EasyDataTable :headers="headers" :items="items" :theme-color="'var(--primary-color)'" :search-value="searchValue"
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
        <template #item-email="{ email }">
            <span>{{ email }}</span>
        </template>
        <template #item-status="{ status }">
            <span :class="`status ${status}`">{{ status }}</span>
        </template>
        <template #item-chat="{ chat }">
            <ul class="btns">
                <li>
                    <RouterLink :to="{ name: 'chat', params: { id: chat } }">
                        <button class="btn btn--icon only-icon">
                            <MessageIcon /> 
                        </button>
                    </RouterLink>
                </li>
            </ul>
        </template>
    </EasyDataTable>
</template>
  
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import axios from "axios";
import router from "@/router";
import type { Header, Item } from "vue3-easy-data-table";
import EasyDataTable from "vue3-easy-data-table";
import type { UserInterface } from "@/interfaces/user.interface";
import { SearchIcon, MessageIcon } from "@/components/icons";
import type { ChatInterface } from "@/interfaces/chat.interface";
import { useUserStore } from "@/stores/user";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
    name: "ChatLobby",
    components: {
        EasyDataTable,
        SearchIcon,
        MessageIcon,
    },
    setup() {
        const userStore = useUserStore();
        const searchValue = ref("");
		const alertStore = useAlertStore();

        const users = ref([] as UserInterface[]);
        const headers = [
            { text: "AVATAR", value: "avatar", sortable: false },
            { text: "PSEUDO", value: "pseudo" },
            { text: "EMAIL", value: "email" },
            { text: "STATUS", value: "status", sortable: true },
            { text: "", value: "chat" },
        ] as Header[];
        const items = ref([] as Item[]);

        const getUser = (chat: ChatInterface) => {
            if (chat.users[0].user.id === userStore.user.id) {
                return chat.users[1].user;
            } else {
                return chat.users[0].user;
            }
        };
        watch(searchValue, (newVal, oldVal) => {
            const lastChar = newVal.at(-1);
            const regexSpecialChars = /[\/\\^$*+?.()|[\]{}]/g;
            if (regexSpecialChars.test(newVal)) {
                    searchValue.value = newVal.replace(regexSpecialChars, '');
                }
        });
        axios
            .get(`${import.meta.env.VITE_APP_API_URL}/chats/@me`, {
                withCredentials: true,
            })
            .then((response) => {
                const chats = response.data.chats;

                chats.forEach((chat: ChatInterface) => {
                    const user = getUser(chat);
                    users.value.push(user);
                    user.id = chat.id;
                });

                items.value = users.value.map((user) => ({
                    avatar: user.avatar,
                    pseudo: user.pseudo,
                    email: user.email,
                    status: user.status ? user.status.toLowerCase() : "",
                    chat: user.id,
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
                        router.push({ path: "/" });
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
  