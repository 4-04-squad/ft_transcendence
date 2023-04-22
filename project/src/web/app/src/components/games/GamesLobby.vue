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
                    <button class="btn btn--normal btn-game-filter only-waiting" @click="filterWaiting">
                        En attente
                    </button>
                </li>
                <li>
                    <button class="btn btn--normal btn-game-filter only-in-progress" @click="filterInProgress">
                        En cours
                    </button>
                </li>
                <li>
                    <button class="btn btn--normal btn-game-filter only-finished" @click="filterFinished">
                       Terminée
                    </button>
                </li>
                <li>
                    <button class="btn btn--normal btn-game-filter only-all active" @click="filterAll">
                        Tout
                    </button>
                </li>
            </ul>
        </h1>
    </div>
    <EasyDataTable :headers="headers" :items="items" :theme-color="'var(--primary-color)'" :search-value="searchValue"
        :buttons-pagination="true" empty-message="Aucun game trouvé" :rows-items="[10, 15, 20]" :rows-per-page="5"
        rows-per-page-message="Games par page">
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
</template>
  
<script lang="ts">
import { defineComponent, ref } from "vue";
import axios from "axios";
import router from "@/router";
import type { Header, Item } from "vue3-easy-data-table";
import EasyDataTable from "vue3-easy-data-table";
import { SearchIcon, AirplayIcon } from "@/components/icons";
import type { GameInterface } from "@/interfaces/game.interface";
import { useUserStore } from "@/stores/user";
import { joinGame, getGames } from "@/services/gameServices";

export default defineComponent({
    name: "GamesLobby",
    components: {
        EasyDataTable,
        SearchIcon,
        AirplayIcon,
    },
    setup() {
        const searchValue = ref("");
        const userStore = useUserStore();
        const games = ref([] as GameInterface[]);
        const headers = [
            { text: "ID", value: "id", sortable: true },
            { text: "USERS", value: "players" },
            { text: "STATUS", value: "status", sortable: true },
            { text: "PLAYERS", value: "users", sortable: true },
            { text: "", value: "game" }, // game id
        ] as Header[];
        const items = ref([] as Item[]);

        const removeActiveClass = () => {
            document.querySelector(".only-waiting")?.classList.remove("active");
            document.querySelector(".only-in-progress")?.classList.remove("active");
            document.querySelector(".only-finished")?.classList.remove("active");
            document.querySelector(".only-all")?.classList.remove("active");
        };

        const filterWaiting = () => {
            removeActiveClass();
            document.querySelector(".only-waiting")?.classList.add("active");
            items.value = games.value
                .filter((game) => game.status == "WAITING" && !game.users.some((user) => user.id == userStore.user.id))
                .map((game) => {
                    return {
                        id: game.id,
                        game: game.id,
                        status: game.status,
                        players: game.users,
                        users: game.users.length,
                    };
                });
        };

        const filterInProgress = () => {
            removeActiveClass();
            document.querySelector(".only-in-progress")?.classList.add("active");
            items.value = games.value
                .filter((game) => game.status == "INPROGRESS")
                .map((game) => {
                    return {
                        id: game.id,
                        game: game.id,
                        status: game.status,
                        players: game.users,
                        users: game.users.length,
                    };
                });
        };

        const filterFinished = () => {
            removeActiveClass();
            document.querySelector(".only-finished")?.classList.add("active");
            items.value = games.value
                .filter((game) => game.status == "FINISHED")
                .map((game) => {
                    return {
                        id: game.id,
                        game: game.id,
                        status: game.status,
                        players: game.users,
                        users: game.users.length,
                    };
                });
        };

        const filterAll = () => {
            removeActiveClass();
            document.querySelector(".only-all")?.classList.add("active");
            items.value = games.value.map((game) => {
                return {
                    id: game.id,
                    game: game.id,
                    status: game.status,
                    players: game.users,
                    users: game.users.length,
                };
            });
        };
        
        getGames().then((response) => {                
            games.value = response.data.games;
            items.value = games.value.map((game) => {
                return {
                    id: game.id,
                    game: game.id,
                    status: game.status,
                    players: game.users,
                    users: game.users.length,
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

        const joinAndNavigate = (gameId: number) => {
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
            filterWaiting,
            filterInProgress,
            filterFinished,
            filterAll,
            joinGame,
            joinAndNavigate,
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
</style>
