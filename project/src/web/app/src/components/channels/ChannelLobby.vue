<template>
    <div class="head">
        <h1 class="title title--search">
            <span> Rechercher un channel</span>
            <div class="search search--icon">
                <SearchIcon />
                <input type="text" v-model="searchValue" placeholder="Rechercher" />
            </div>
            <div class="btns my-4">
                <button class="btn btn--success" @click="toggleCreateChannelModal()" >
                    Create
                </button>
            </div>
        </h1>
    </div>
    <EasyDataTable :headers="headers" :items="items" :theme-color="'var(--primary-color)'" :search-value="searchValue"
        :buttons-pagination="true" empty-message="Aucun channel trouvé" :rows-items="[10, 15, 20]" :rows-per-page="5"
        rows-per-page-message="Channels par page" :body-row-class-name="bodyRowClassNameFunction">
        <template #item-name="{ name, channel, type }">
            <span @click.stop="joinChannelfunc(type, channel)" v-if="name">{{ name }}</span>
            <span @click.stop="joinChannelfunc(type, channel)" v-else>Channel <span class="channel-name">#{{ channel }}</span></span>
        </template>
        <template #item-channel="{ channel, type }">
            <ul class="btns">
                <li>
                    <button @click="joinChannelfunc(type, channel)" class="btn btn--icon only-icon">
                        <MessageIcon /> 
                    </button>
                </li>
                <button @click="leaveChannel(channel)" class="btn btn--icon x--icon">
                    <XIcon />
                </button>
            </ul>
        </template> 
    </EasyDataTable>
    <ChannelPasswdModal v-if="showPasswdModal" @onClose="togglePasswdModal" @onCreate="onPasswdReceived"/>
    <ChannelSettingsModal v-if="showCreateChannelModal" @onClose="toggleCreateChannelModal" @onCreate="onSettingReceived"/>
</template>
  
<script lang="ts">
import { defineComponent, inject, ref, watch } from "vue";
import axios from "axios";
import router from "@/router";
import type { Header, Item, BodyRowClassNameFunction } from "vue3-easy-data-table";
import EasyDataTable from "vue3-easy-data-table";
import { SearchIcon, MessageIcon, XIcon } from "@/components/icons";
import type { ChatInterface, IChannelSettings } from "@/interfaces/chat.interface";
import ChannelSettingsModal from "@/components/channels/ChannelSettingsModal.vue";
import ChannelPasswdModal from "@/components/channels/ChannelPasswdModal.vue";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
import type { Socket } from "socket.io-client";
import { useUserStore } from "@/stores/user";

export default defineComponent({
    name: "ChatLobby",
    components: {
    EasyDataTable,
    SearchIcon,
    MessageIcon,
    ChannelSettingsModal,
    ChannelPasswdModal,
    XIcon,
},
    setup() {
        const alertStore = useAlertStore();
        const userStore = useUserStore();
        const searchValue = ref("");
        const updatedAt = ref("");
        const showCreateChannelModal = ref(false);
        const showPasswdModal = ref(false);
        const channels = ref([] as ChatInterface[]);
        const socket = inject('socket') as Socket;
        const headers = [
            { text: "NAME", value: "name" },
            { text: "TYPE", value: "type" },
            { text: "CREATED AT", value: "createdAt", sortable: true, type: "date"},
            { text: "", value: "channel" }, // channel id
        ] as Header[];
        const items = ref([] as Item[]);
        const channelId = ref("");

        socket.on("createChannel", (data: any) => {
            updatedAt.value = data.updatedAt;
        });

        watch(searchValue, (newVal, oldVal) => {
            const lastChar = newVal.at(-1);
            const regexSpecialChars = /[\/\\^$*+?.()|[\]{}]/g;
            if (regexSpecialChars.test(newVal)) {
                    searchValue.value = newVal.replace(regexSpecialChars, '');
                }
        });

         // watch updatedAt to update the channels list every new created game
        watch(updatedAt, () => {
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
                            // format date to dd/mm/yyyy hh:mm
                            createdAt: new Date(channel.createdAt).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                        };
                    });
                })
                .catch((error) => {
                    const alert = {
                    status: error.response.status,
                    message: error.response.data.message,
                    } as AlertInterface;

                    alertStore.setAlert(alert);
                    if (axios.isAxiosError(error)) {
                        if (error.response?.status == 401) {
                            router.push({ path: "/" });
                        }
                    }
                });
        });


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
                        // format date to dd/mm/yyyy hh:mm
                        createdAt: new Date(channel.createdAt).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                    };
                });
            })
            .catch((error) => {
                const alert = {
                status: error.response.status,
                message: error.response.data.message,
                } as AlertInterface;

                alertStore.setAlert(alert);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status == 401) {
                        router.push({ path: "/" });
                    }
                }
            });
        
        const joinChannelfunc = (type: string, chatId: string) => {
            if (type == "RESTRICTED") {
                togglePasswdModal(type, chatId);
            } else {
                joinChannel(chatId);
            }
        };

        const togglePasswdModal = (type: string, chatId: string) => {
            channelId.value = chatId;
            showPasswdModal.value = !showPasswdModal.value;
        };

        const toggleCreateChannelModal = () => {
            showCreateChannelModal.value = !showCreateChannelModal.value;
        };

        const createChannel = (channelSettings: IChannelSettings) => {
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
                    updatedAt.value = new Date().toISOString();
                    socket.emit('createChannel', {updatedAt: updatedAt});
                    router.push({
                        name: "channel",
                        params: {
                            id: response.data.channel.id,
                        },
                    });
                }).catch((error) => {
                    const alert = {
                    status: error.response.status,
                    message: error.response.data.message,
                    } as AlertInterface;

                    alertStore.setAlert(alert);
                    if (axios.isAxiosError(error)) {
                        if (error.response?.status == 401) {
                            router.push({ path: "/" });
                        }
                    }
                });
        };

        const joinChannel = (id: string, passwd?: string) => {
            if (!id) {
                return;
            }
            const response = axios
            .post(
                `${import.meta.env.VITE_APP_API_URL}/channels/join`,
                {
                chatId: id,
                passwd: passwd,
                },
                {
                withCredentials: true,
                headers: {"Content-Type": "application/json",
                },
                }
            ).then((res) => {
                updatedAt.value = new Date().toISOString();
                socket.emit('updateChannelMembersList', {updatedAt: updatedAt, channelId: res.data.channel.id});
                router.push({
                name: "channel",
                params: {
                    id: res.data.channel.id,
                },
                });
            }).catch((err) => {
                const alert = {
                    status: err.response.status,
                    message: err.response.data.message,
                  } as AlertInterface;

                  alertStore.setAlert(alert);
                router.push({
                    name: "channels"
                })
            });
        };

        const onSettingReceived = (newSetting: IChannelSettings) => {
            toggleCreateChannelModal();
            createChannel(newSetting);
        };

        const onPasswdReceived = (passwd: string) => {
            showPasswdModal.value = !showPasswdModal.value;
            joinChannel(channelId.value, passwd);
        };

        const bodyRowClassNameFunction: BodyRowClassNameFunction = (item: Item, rowNumber: number): string => {
            return `channel-${ item.channel }`;
        };

        return {
            searchValue,
            showCreateChannelModal,
            showPasswdModal,
            headers,
            items,
            alertStore,
            joinChannelfunc,
            bodyRowClassNameFunction,
            toggleCreateChannelModal,
            togglePasswdModal,
            createChannel,
            joinChannel,
            onSettingReceived,
            onPasswdReceived,
            socket,
            updatedAt,
            userStore,
        };

    },
    methods: {
        async leaveChannel(id: string) {
            const response = await axios
            .get(
                `${import.meta.env.VITE_APP_API_URL}/channels/${id}/leave`,
                {
                withCredentials: true,
                headers: {"Content-Type": "application/json",
                },
                }
            ).then((res) => {
                this.socket.emit('updateChannelMembersList', {updatedAt: new Date().toISOString(), channelId: id});
                const alert = {
                    status: 200,
                    message: "Successfully left channel",
                }
                this.updatedAt = new Date().toISOString();
                this.socket.emit('createChannel', {updatedAt: this.updatedAt});
                this.alertStore.setAlert(alert);
            }).catch((error) => {
                const alert = {
                status: error.response.status,
                message: error.response.data.message,
                } as AlertInterface;

                this.alertStore.setAlert(alert);
                router.push ({
                    name: "channels"
                })
            });
        }
    },
});
</script>
  
<style lang="scss">
.channel-name {
    color: var(--primary-color);
    font-weight: bold;
}
</style>