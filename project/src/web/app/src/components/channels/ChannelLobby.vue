<template>
    <div class="head">
        <h1 class="title title--search">
            <span> Rechercher un channel</span>
            <div class="search search--icon">
                <SearchIcon />
                <input type="text" v-model="searchValue" placeholder="Rechercher" />
            </div>
        </h1>
    </div>
    <EasyDataTable :headers="headers" :items="items" :theme-color="'var(--primary-color)'" :search-value="searchValue"
        :buttons-pagination="true" empty-message="Aucun channel trouvé" :rows-items="[10, 15, 20]" :rows-per-page="5"
        rows-per-page-message="Channels par page">
        <template #item-name="{ name, channel }">
            <RouterLink :to="{ name: 'channel', params: { id: channel } }">
                <span v-if="name">{{ name }}</span>
                <span v-else>Channel <span class="channel-name">#{{ channel }}</span></span>
            </RouterLink>
        </template>
        <template #item-channel="{ channel }">
            <ul class="btns">
                <li>
                    <RouterLink :to="{ name: 'channel', params: { id: channel } }">
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
import { defineComponent, ref } from "vue";
import axios from "axios";
import router from "@/router";
import type { Header, Item } from "vue3-easy-data-table";
import EasyDataTable from "vue3-easy-data-table";
import { SearchIcon, MessageIcon } from "@/components/icons";
import type { ChatInterface } from "@/interfaces/chat.interface";

export default defineComponent({
    name: "ChatLobby",
    components: {
        EasyDataTable,
        SearchIcon,
        MessageIcon,
    },
    setup() {
        const searchValue = ref("");

        const channels = ref([] as ChatInterface[]);
        const headers = [
            { text: "NAME", value: "name" },
            { text: "TYPE", value: "type" },
            { text: "", value: "channel" }, // channel id
        ] as Header[];
        const items = ref([] as Item[]);

        axios
            .get(`${import.meta.env.VITE_APP_API_URL}/channels`, {
                withCredentials: true,
            })
            .then((response) => {
                //console.log(response.data.channels);
                channels.value = response.data.channels;

                items.value = channels.value.map((channel) => {
                    return {
                        name: channel.name,
                        channel: channel.id,
                        type: channel.type,
                    };
                });
            })
            .catch((error) => {
                console.log(error);
                if (axios.isAxiosError(error)) {
                    console.log(error.response?.data);
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
  
<style lang="scss">
.channel-name {
    color: var(--primary-color);
    font-weight: bold;
}
</style>