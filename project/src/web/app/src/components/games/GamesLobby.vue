<template>
    <div class="head">
        <h1 class="title title--search">
            <span> Rechercher une game</span>
            <div class="search search--icon">
                <SearchIcon />
                <input type="text" v-model="searchValue" placeholder="Rechercher" />
            </div>
            <div class="btns my-4">
                <button class="btn btn--success create-game" @click="toggleCreateGameModal">
                    <p>Créer une game</p>
                </button>
                <button class="btn btn--success create-game" @click="searchAndJoinGame">
                    <p>Matchmaking</p>
                </button>
            </div>
        </h1>
    </div>
    <ul class="games-filters">
        <li>
            <button class="btn btn--normal btn-game-filter only-mine" @click="filterGames('MINE')">
                Mes parties
            </button>
        </li>
        <li>
            <button class="btn btn--normal btn-game-filter only-waiting" @click="filterGames('WAITING')">
                En attente
            </button>
        </li>
        <li>
            <button class="btn btn--normal btn-game-filter only-inprogress" @click="filterGames('INPROGRESS')">
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
    <EasyDataTable :headers="headers" :items="items" :theme-color="'var(--primary-color)'" :buttons-pagination="true"
        empty-message="Aucun game trouvé" :rows-items="[10, 15, 20]" :rows-per-page="5"
        rows-per-page-message="Games par page">
        <template #item-id="{ id, status }">
            <RouterLink :to="{ name: 'game', params: { id: id } }" v-if="status != 'FINISHED'">
                <span>Game <span class="game-name">#{{ id }}</span></span>
            </RouterLink>
            <span v-else>Game <span class="game-name not-allowed">#{{ id }}</span></span>
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
            <ul class="btns" v-if="status == 'WAITING'">
                <li @click="joinAndNavigate(game)">
                    <button class="btn btn--icon only-icon">
                        <AirplayIcon />
                    </button>
                </li>
            </ul>
        </template>
    </EasyDataTable>
    <GameSettingsModal v-if="showCreateGameModal" @onClose="toggleCreateGameModal" @onCreate="onSettingReceived" />
</template>
  
<script lang="ts">
import { defineComponent, ref, computed, watch, inject } from "vue";
import axios from "axios";
import router from "@/router";
import type { Header, Item } from "vue3-easy-data-table";
import EasyDataTable from "vue3-easy-data-table";
import { SearchIcon, AirplayIcon } from "@/components/icons";
import type { GameInterface, IGameSettings } from "@/interfaces/game.interface";
import { useUserStore } from "@/stores/user";
import { joinGame, getGames, createGame } from "@/services/gameServices";
import GameSettingsModal from "@/components/games/GamesSettingsModal.vue";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";
import type { Socket } from "socket.io-client";

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
        const alertStore = useAlertStore();
        const games = ref([] as GameInterface[]);
        const showCreateGameModal = ref(false);
        const socket = inject('socket') as Socket;
		
        const headers = [
            { text: "ID", value: "id", sortable: true },
            { text: "USERS", value: "players" },
            { text: "STATUS", value: "status", sortable: true },
            { text: "PLAYERS", value: "users", sortable: true },
            { text: "", value: "game" }, // game id
        ] as Header[];
        const items = ref([] as Item[]);

        const defaultGameSettings: IGameSettings = {
            gameId: '0',
            ballSpeed: 5,
            paddleSpeed: 5,
            ballColor: "#ffffff",
            backgroundColor: "#000000",
            ballSize: 5,
            paddleSize: 5,
            paddleColor: "#ffffff",
            scoreLimit: 10,
        };

        const removeActiveClass = () => {
            document.querySelectorAll(".btn-game-filter").forEach((element) => {
                element.classList.remove("active");
            });
        };

        const toggleCreateGameModal = () => {
            showCreateGameModal.value = !showCreateGameModal.value;
        };

        // function to join a waiting game where the user elo is closest to the current user elo
        const searchAndJoinGame = () => {
            // const userElo = userStore.user.elo;
            // const waitingGames = games.value.filter((game) => game.status == "WAITING");
            // if no waiting game, create one
            
            socket.emit("joinWaitingGame", {
                userId: userStore.user.id
            });

            socket.emit("waiting", {
                userId: userStore.user.id,
            });
            return
                
            
            // const closestGame = waitingGames.reduce((prev, curr) => {
            //     const prevElo = prev.users[0].elo;
            //     const currElo = curr.users[0].elo;
            //     // if the current game is closer to the user elo than the previous one, return it
            //     if (prevElo && currElo)
            //         if (Math.abs(userElo - currElo) < Math.abs(userElo - prevElo))
            //             return curr;
            //     return prev;
            // });
            // joinAndNavigate(closestGame.id);
        };

        socket.on("waiting", (data: any) => {
            console.log("data: ", data);
            if(data.gameId !== undefined && data.userId != userStore.user.id){
                joinAndNavigate(data.gameId);
                socket.emit("leaveWaiting", {
                    userId: userStore.user.id,
                })
            }
            else if (data.userId != userStore.user.id) {
                createGame(defaultGameSettings).then((response) => {
                    console.log(response);
                    socket.emit("waiting", {
                        userId: userStore.user.id,   
                        gameId: response.data.game.id,
                    });
                    router.push({ name: "game", params: { id: response.data.game.id } });
                    socket.emit("leaveWaiting", {
                        userId: userStore.user.id,
                    })
                })
            }
        });

        watch(searchValue, () => {
            items.value = filteredItems.value;
        });

        const filteredItems = computed(() => {
            if (searchValue.value.trim() === "") return games.value.map(mapGameToItem);
            return games.value.filter((game) => {
                return (
                    game.users.some((user) => {
                        if (user.pseudo)
                            user.pseudo.toLowerCase().includes(searchValue.value.toLowerCase())
                    }
                        ) ||
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
                const alert = {
                    status: error.response.data.statusCode,
                    message: error.response.data.message,
                } as AlertInterface;

                alertStore.setAlert(alert);
                router.push({
                    name: "games",
                });
            });

        const onSettingReceived = (newSetting: IGameSettings) => {
            toggleCreateGameModal();
            createGameAndNavigate(newSetting);
        };

        const createGameAndNavigate = (gameSettings: IGameSettings) => {
            // create game add the settings to the store and navigate to the game
            createGame(gameSettings).then((response) => {
                router.push({ name: "game", params: { id: response.data.games.id } });
            })
                .catch((error) => {
                    const alert = {
                        status: error.response.data.statusCode,
                        message: error.response.data.message,
                    } as AlertInterface;

                    alertStore.setAlert(alert);
                    router.push({
                        name: "games",
                    });
                });
        };

        const joinAndNavigate = (gameId: string) => {
            const game = games.value.find((game) => game.id == gameId);
            // if user is already in the game, just navigate to it
            if (game?.users.some((user) => user.id == userStore.user.id)) {
                router.push({ name: "game", params: { id: gameId } });
                return;
            }
            // else join the game and navigate to it
            joinGame(gameId).then((response) => {
                router.push({ name: "game", params: { id: gameId } });
            })
                .catch((error) => {
                    const alert = {
                        status: error.response.data.statusCode,
                        message: error.response.data.message,
                    } as AlertInterface;

                    alertStore.setAlert(alert);
                    router.push({
                        name: "games",
                    });
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
            searchAndJoinGame,
            socket
        };
    },
});
</script>
  
<style lang="scss">
.games-filters {
    display: flex;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 1.5rem auto;
    font-size: 0.5rem;
    overflow-x: auto;
    width: 100%;
    justify-content: center;

    @media screen and (max-width: 768px) {
        justify-content: flex-start;
        padding-right: 1rem !important;
    }

    li {
        margin-left: 1rem;
        font-weight: bold;

        .btn {
            white-space: nowrap;

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

.create-game {
    margin-top: 20px;
}
</style>
