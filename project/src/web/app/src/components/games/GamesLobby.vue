<template>
    <div class="head">
        <h1 class="title title--search">
            <span> Rechercher une game</span>
                <div class="search search--icon">
                    <SearchIcon />
                    <input type="text" v-model="searchValue" placeholder="Rechercher" />
                </div>
            <ul class="games-filters">
                <li>
                    <button class="btn btn--normal btn-game-filter only-waiting" @click="filterGames('MINE')">
                        Mes parties
                    </button>
                </li>
                <li>
                    <button class="btn btn--normal btn-game-filter only-waiting" @click="filterGames('WAITING')">
                        En attente
                    </button>
                </li>
                <li>
                    <button class="btn btn--normal btn-game-filter only-in-progress" @click="filterGames('INPROGRESS')">
                        En cours
                    </button>
                </li>
                <li>
                    <button class="btn btn--normal btn-game-filter only-finished" @click="filterGames('FINISHED')">
                       Terminée
                    </button>
                </li>
                <li>
                    <button class="btn btn--normal btn-game-filter only-all active" @click="filterGames('ALL')">
                        Tout
                    </button>
                </li>
            </ul>
            <button class="btn btn--submit create-game" @click="toggleCreateGameModal">
                <p>Créer une game</p>
            </button>
        </h1>
    </div>
    <EasyDataTable
        :headers="headers"
        :items="items"
        :theme-color="'var(--primary-color)'"
        :buttons-pagination="true"
        empty-message="Aucun game trouvé"
        :rows-items="[10, 15, 20]"
        :rows-per-page="5"
        rows-per-page-message="Games par page"
    >
        <template #item-id="{ id }">
            <RouterLink :to="{ name: 'game', params: { id: id } }">
                <span>Game <span class="game-name">#{{ id }}</span></span>
            </RouterLink>
        </template>
        <template #item-users="{ users }">
            <span>{{ users }} / 2</span>
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
        <template #item-game="{ game, status }">
            <ul class="btns"  v-if="status == 'WAITING'">
                <li @click="joinAndNavigate(game)">
                        <button class="btn btn--icon only-icon">
                            <AirplayIcon />
                        </button>
                </li>
            </ul>
        </template>
    </EasyDataTable>
    <GameSettingsModal v-if="showCreateGameModal" @onClose="toggleCreateGameModal" @onCreate="onSettingReceived"/>
</template>
  
<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import axios from "axios";
import router from "@/router";
import type { Header, Item } from "vue3-easy-data-table";
import EasyDataTable from "vue3-easy-data-table";
import { SearchIcon, AirplayIcon } from "@/components/icons";
import type { GameInterface, IGameSettings } from "@/interfaces/game.interface";
import { useUserStore } from "@/stores/user";
import { joinGame, getGames, createGame } from "@/services/gameServices";
import GameSettingsModal from "@/components/games/GamesSettingsModal.vue";
import { useGamesSettingsStore } from "@/stores/gamesSettingsStore";

export default defineComponent({
    name: "GamesLobby",
    components: {
        EasyDataTable,
        SearchIcon,
        AirplayIcon,
        GameSettingsModal,
    },
    setup() {
        const searchValue = ref("");
        const userStore = useUserStore();
        const gamesettingsStore = useGamesSettingsStore();
        const games = ref([] as GameInterface[]);
        const showCreateGameModal = ref(false);
        const headers = [
            { text: "ID", value: "id", sortable: true },
            { text: "USERS", value: "players" },
            { text: "STATUS", value: "status", sortable: true },
            { text: "PLAYERS", value: "users", sortable: true },
            { text: "", value: "game" }, // game id
        ] as Header[];
        const items = ref([] as Item[]);

        const removeActiveClass = () => {
            document.querySelectorAll(".btn-game-filter").forEach((element) => {
                element.classList.remove("active");
            });
        };

        const toggleCreateGameModal = () => {
            showCreateGameModal.value = !showCreateGameModal.value;
        };

        watch(searchValue, () => {
            items.value = filteredItems.value;
        });

        const filteredItems = computed(() => {
            if (searchValue.value.trim() === "") return games.value.map(mapGameToItem);
            return games.value.filter((game) => {
                return (
                    game.users.some((user) => user.pseudo.toLowerCase().includes(searchValue.value.toLowerCase())) ||
                    game.id.toString().includes(searchValue.value) ||
                    game.status.toLowerCase().includes(searchValue.value.toLowerCase())
                );
            }).map(mapGameToItem);
        });

        const mapGameToItem = (game: GameInterface) => {
            return {
                id: game.id,
                game: game.id,
                status: game.status,
                players: game.users,
                users: game.users.length,
            };
        };

        const filterGames = (type: string) => {
            removeActiveClass();
            document.querySelector(`.only-${type.toLowerCase()}`)?.classList.add("active");
            const userId = userStore.user.id;

            items.value = games.value
                .filter((game) => {
                    switch (type) {
                        case "MINE":
                            return game.users.some((user) => user.id == userId);
                        case "WAITING":
                            return game.status == "WAITING" && !game.users.some((user) => user.id == userId);
                        case "INPROGRESS":
                            return game.status == "INPROGRESS";
                        case "FINISHED":
                            return game.status == "FINISHED";
                        case "ALL":
                        default:
                            return !(game.status == "WAITING" && game.users.some((user) => user.id == userId));
                    }
                })
                .map(mapGameToItem);
        };

        getGames().then((response) => {                
            games.value = response.data.games;
            filterGames("ALL");
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

        const onSettingReceived = (newSetting: IGameSettings) => {
            toggleCreateGameModal();
            createGameAndNavigate(newSetting);
        };

        const createGameAndNavigate = (gameSettings: IGameSettings) => {
            createGame().then((response) => {
                gamesettingsStore.addGameSettings({
                    ...gameSettings,
                    gameId: response.data.games.id,
                });
                router.push({ name: "game", params: { id: response.data.games.id } });
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
        };

        const joinAndNavigate = (gameId: number) => {
            const game = games.value.find((game) => game.id == gameId);
            if (game?.users.some((user) => user.id == userStore.user.id)){
                router.push({ name: "game", params: { id: gameId } });
                return;
            }
            joinGame(gameId).then((response) => {
                router.push({ name: "game", params: { id: gameId } });
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
        };

        return {
            searchValue,
            headers,
            items,
            showCreateGameModal,
            toggleCreateGameModal,
            filterGames,
            joinGame,
            joinAndNavigate,
            onSettingReceived,
        };
    },
});
</script>
  
<style lang="scss">

.games-filters {
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: 0;
    list-style: none;
    padding: 0;
    margin: 1.5rem auto 0;
    font-size: 0.5rem;

    li {
        margin-left: 1rem;
        font-weight: bold;

        .btn {
            &.active {
                background-color: var(--primary-color);
                color: #ffffff;
            }
        }
    }
}

.game-name {
    font-weight: bold;
}

.game-status {
    &--waiting {
        color: var(--accent-color);
    }

    &--playing {
        color: var(--primary-color);
    }

    &--finished {
        color: var(--success-color);
    }
}

.players {
    display: flex;
    flex-direction: row;
    align-items: center;
    
  }
  
.players__item {
    margin-right: 5px;
}

.create-game{
    margin-top: 20px;
}

</style>
