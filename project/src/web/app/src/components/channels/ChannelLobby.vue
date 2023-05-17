<template>
    <div class="head">
        <h1 class="title title--search">
            <span> Rechercher un channel</span>
            <div class="search search--icon">
                <SearchIcon />
                <input type="text" v-model="searchValue" placeholder="Rechercher" />
            </div>
            <button class="btn btn--submit" @click="toggleCreateChannelModal()" >
                Create
            </button>
        </h1>
    </div>
    <EasyDataTable :headers="headers" :items="items" :theme-color="'var(--primary-color)'" :search-value="searchValue"
        :buttons-pagination="true" empty-message="Aucun channel trouvé" :rows-items="[10, 15, 20]" :rows-per-page="5"
        rows-per-page-message="Channels par page">
        <template #item-name="{ name, channel }">
            <span @click.stop="joinChannel(channel)" v-if="name">{{ name }}</span>
            <span @click.stop="joinChannel(channel)" v-else>Channel <span class="channel-name">#{{ channel }}</span></span>
        </template>
        <template #item-channel="{ channel }">
            <ul class="btns">
                <li>
                    <button @click="joinChannel(channel)" class="btn btn--icon only-icon">
                        <MessageIcon /> 
                    </button>
                </li>
                <button @click="leaveChannel(channel)" class="btn btn--icon x--icon">
                    <XIcon />
                </button>
            </ul>
        </template>
    </EasyDataTable>
    <ChannelSettingsModal v-if="showCreateChannelModal" @onClose="toggleCreateChannelModal" @onCreate="onSettingReceived"/>
</template>
  
<script lang="ts">
import { defineComponent, ref } from "vue";
import axios from "axios";
import router from "@/router";
import type { Header, Item } from "vue3-easy-data-table";
import EasyDataTable from "vue3-easy-data-table";
import { SearchIcon, MessageIcon, XIcon } from "@/components/icons";
import type { ChatInterface, IChannelSettings } from "@/interfaces/chat.interface";
import ChannelSettingsModal from "./ChannelSettingsModal.vue";
import { channel } from "diagnostics_channel";

export default defineComponent({
    name: "ChatLobby",
    components: {
			EasyDataTable,
			SearchIcon,
			MessageIcon,
			ChannelSettingsModal,
			XIcon
		},
    setup() {
        const searchValue = ref("");
        const showCreateChannelModal = ref(false);
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

        const toggleCreateChannelModal = () => {
            showCreateChannelModal.value = !showCreateChannelModal.value;
        };

        const createChannel = (channelSettings: IChannelSettings) => {
            try {
                axios.post(
                    `${import.meta.env.VITE_APP_API_URL}/channels/create`,
                    {
                        name: channelSettings.name,
                        type: channelSettings.type,
                        password: channelSettings.password
                    },
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                ).then((response) => {
                    console.log(response);
                    router.push({
                        name: "channel",
                        params: {
                            id: response.data.channel.id,
                        },
                    });
                }).catch((error) => {
                    console.log(error);
                    if (axios.isAxiosError(error)) {
                        console.log(error.response?.data);
                        if (error.response?.status == 401) {
                            router.push({ path: "/" });
                        }
                    }
                });
            } catch (error: any) {
                console.log(error);
            }
        };

        const onSettingReceived = (newSetting: IChannelSettings) => {
            console.log(newSetting);
            toggleCreateChannelModal();
            createChannel(newSetting);
        };
        return {
            searchValue,
            showCreateChannelModal,
            headers,
            items,
            toggleCreateChannelModal,
            createChannel,
            onSettingReceived,
        };
    },
    methods: {
        async leaveChannel(id: string) {
            try {
                const response = await axios
                .get(
                    `${import.meta.env.VITE_APP_API_URL}/channels/${id}/leave`,
                    {
                    withCredentials: true,
                    headers: {"Content-Type": "application/json",
                    },
                    }
                ).then((res) => {
                })
                    .catch((err) => {
                    console.log(err);
                    });
                } catch (error: any) {
                console.log(error);
                }
        },

        async joinChannel(id: string) {
        try {
            const response = await axios
            .post(
                `${import.meta.env.VITE_APP_API_URL}/channels/join`,
                {
                chatId: id,
                },
                {
                withCredentials: true,
                headers: {"Content-Type": "application/json",
                },
                }
            ).then((res) => {
                this.$router.push({
                name: "channel",
                params: {
                    id: res.data.channel.id,
                },
                });
            })
                .catch((err) => {
                console.log(err);
                });
            } catch (error: any) {
            console.log(error);
            }
    },
    },
});
</script>
  
<style lang="scss">
.channel-name {
    color: var(--primary-color);
    font-weight: bold;
}
</style>