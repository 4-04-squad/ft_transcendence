<template>
	<div class="field-view-container" ref="container">
		<div class="field-view-container__game-zone">
			<div class="game-buttons">
				<button v-if="btnOnePlayer" @click="oneplayer" class="btn">partie solo</button>

				<button v-if="btnMultiPlayer" @click="multiplayer" class="btn">{{ buttonText }}</button>

				<button v-if="btnQuitGame" class="btn">
					<RouterLink :to="{ name: 'games' }">retour au lobby</RouterLink>
				</button>
			</div>
			<canvas id="Field" ref="Field">
			</canvas>
		</div>
	</div>
</template>

<script lang="ts">
import type { AlertInterface } from "@/interfaces/alert.interface";
import type { Ball, CPU, Score, Player } from "@/interfaces/game.interface";
import { UserStatus } from "@/interfaces/user.interface";
import router from "@/router";
import type { GameInterface } from "@/interfaces/game.interface";
import { endGame, deleteGame, updateGameStatus, getGameById } from "@/services/gameServices";
import { useAlertStore } from "@/stores/alert";
import { useUserStore } from "@/stores/user";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

enum userGameStatus {
	WINNER = "WINNER",
	LOSER = "LOSER",
	DRAW = "DRAW",
}

export default defineComponent({
	name: "FieldView",
	props: {
		gameData: {
			type: Object,
			required: true,
		},
		socket: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			buttonText: 'Partie Multijoueur'
		}
	},
	setup(props) {
		const userStore = useUserStore();
		const route = useRoute();
		const alertStore = useAlertStore();
		let context = {} as any;

		const btnOnePlayer = ref(true);
		const btnMultiPlayer = ref(false);
		const btnQuitGame = ref(false);
		const gameDataUpdated = ref({} as any);
		const isReady = ref(0);

		getGameById(route.params.id as string).then((data) =>{
			gameDataUpdated.value = data.data;
			if (data.data.games.status == "FINISHED")
			{
				router.push({
					name: "games",
				});
			}
		}
		);

		watch(
			() => props.gameData.users,
			() => {
				if (props.gameData.users.length == 2) {
					if (props.gameData.users[0].id == userStore.user.id || props.gameData.users[1].id == userStore.user.id) {
						isReady.value = 0;
						btnOnePlayer.value = props.gameData.users.length == 1 ? true : false
						btnMultiPlayer.value = props.gameData.users.length == 1 ? false : true
					}
				} else {
					if (props.gameData.users[0].id == userStore.user.id) {
						isReady.value = 0;
						btnOnePlayer.value = props.gameData.users.length == 1 ? true : false
					}
				}
			}
		), {
			immediate: true
		};

		const ball: Ball = {
			xb: 0,
			yb: 0,
			x: 0,
			y: 0,
			width: 20,
			velocityx: 1,
			velocityy: 1,
			rebound: 0,
			rebonetime: 2,
			speed: 8,
			animation: 0,
		};

		const cpu: CPU = {
			enable: 0,
			difficulty: 8,
		};

		const score: Score = {
			p1: 0,
			p2: 0,
			color: 'white',
			max_score: 5,
			finish_game: 0,
			none_same: 0,
			noWinner: 0,
		};

		const player1: Player = {
			me: 0,
			speed: 20,
			tile: 75,
			tilewidth: 10,
			x: 0,
			y: 0,
			paddley: 0,
			ply: 1,
			id: "",
			ready: 0,
			canvasX: 0,
			canvasY: 0,
			ratioY: 1,
			ratioX: 1,
		};

		const player2: Player = {
			me: 0,
			speed: 20,
			tile: 75,
			tilewidth: 10,
			x: 0,
			y: 0,
			paddley: 0,
			ply: 2,
			id: "",
			ready: 0,
			canvasX: 0,
			canvasY: 0,
			ratioY: 1,
			ratioX: 1,
		};

		const firstplayer = (id: string) => {
			if (props.gameData.userGames[0].userId == id) {
				player1.me = 1;
			} else {
				player1.me = 0;
			}
			player1.id = id;
		};

		const secondplayer = (id: string) => {
			if (props.gameData.userGames[1].userId == id) {
				player2.me = 0;
			} else {
				player2.me = 1;
			}
			player2.id = id;
		};

		// Socket event listeners envoyer les infos au serveur
		props.socket.on("joinGame", (data: any) => {
			if (props.gameData.userGames[0].userId == userStore.user.id) {
				firstplayer(props.gameData.userGames[0].userId);
				if (props.gameData.userGames.length == 2) {
					secondplayer(props.gameData.userGames[1].userId);
				}
			} else {
				if (props.gameData.userGames.length == 2) {
					firstplayer(props.gameData.userGames[1].userId);
				}
				secondplayer(props.gameData.userGames[0].userId);
			}
			if (props.gameData.userGames.length == 2) {
				btnOnePlayer.value = false;
				btnMultiPlayer.value = true;
			}
		});

		props.socket.on("leaveGame", (data: any) => {
			getGameById(route.params.id as string).then((res) =>{
				gameDataUpdated.value = res.data;
			});
			score.noWinner = 1;
			if (props.gameData.userGames[0].userId != data.userId)
				score.p1 = score.max_score;
			else
				score.p2 = score.max_score;
		});

		props.socket.on("movePlayer", (data: any) => {
			if (player1.me == 0) {
				player1.y = data.position.y;
				player1.paddley = data.position.y + player1.tile;
			}
		});

		props.socket.on("movePlayerTwo", (data: any) => {
			if (player2.me == 0) {
				player2.y = data.position.y;
				player2.paddley = data.position.y + player2.tile;
			}
		});

		props.socket.on("moveBall", (data: any) => {
			if (player1.me == 0) {
				ball.x = data.x;
				ball.y = data.y;
			}
		});

		props.socket.on("updateScore", (data: any) => {
			if (player2.me == 1 && (score.p1 > data.score.p1 || score.p2 > data.score.p2))
			{
				score.none_same = 1;
			}
			else
			{
				score.p1 = data.score.p1;
				score.p2 = data.score.p2;
			}
		});

		props.socket.on("ready", (data: any) => {
			isReady.value++;
		});

		props.socket.on("sendCanvasSizeP1", (data: any) => {
			player1.canvasX = data.width;
			player1.canvasY = data.height;
		});

		props.socket.on("sendCanvasSizeP2", (data: any) => {
			player2.canvasX = data.width;
			player2.canvasY = data.height;
		});


		return {
			player1,
			player2,
			ball,
			score,
			context,
			gameData: props.gameData,
			socket: props.socket,
			cpu,
			userStore,
			alertStore,
			btnOnePlayer,
			btnMultiPlayer,
			btnQuitGame,
			isReady,
			gameDataUpdated,
			firstplayer,
			secondplayer,
		}
	},
	beforeUnmount() {
		// if we leave a waiting game -> delete
		if (!this.gameDataUpdated.games)
			return;
		if (this.gameDataUpdated.games.userGames.length == 1)
			this.menuOfEnd();
		this.socket.emit("leaveGame", { gameId: this.gameData.id, userId: this.userStore.user.id });
   		window.cancelAnimationFrame(this.ball.animation);
		window.removeEventListener("resize", this.handleWindowResize);
	},
	mounted() {
		this.createbackground();
		//set spawn point for player1
		this.player1.x = 10;
		this.player1.y = this.context.canvas.height / 2 - 25;
		this.player1.paddley = this.player1.y + this.player1.tile;
		//set spawn point for player2
		this.player2.x = this.context.canvas.width - 20;
		this.player2.y = this.context.canvas.height / 2 - 25;
		this.player2.paddley = this.player2.y + this.player2.tile;
		//set spawn point for ball
		this.ball.x = this.ball.xb;
		this.ball.y = this.ball.yb;
		if (Math.floor(Math.random() * 2) == 1)
			this.ball.velocityx = -1;
		else
			this.ball.velocityx = 1;
		if (Math.floor(Math.random() * 2) == 1)
			this.ball.velocityy = -1;
		else
			this.ball.velocityy = 1;

		// watch if player is ready
		this.setvar();
		this.resizeVar();
		this.update();
		window.addEventListener("resize", this.handleWindowResize);
	},
	methods: {
		oneplayer() {
			this.btnOnePlayer = false;
			this.btnMultiPlayer = false;
			this.player1.me = 1;
			this.cpu.enable = 1;
			this.player2.ready = 1;
			updateGameStatus(this.gameData.id, 'INPROGRESS')
			.catch((e) => {
				const alert = {
                status: e.response.data.statusCode,
                message: e.response.data.message,
              } as AlertInterface;

             	this.alertStore.setAlert(alert);
			})
		},

		multiplayer() {
			this.buttonText = 'Partie multijouer';
			this.btnOnePlayer = false;
			this.btnMultiPlayer = false;
			this.socket.emit("ready", { gameId: this.gameData.id, userId: this.userStore.user.id });
			if (this.player1.me == 1)
				this.socket.emit("sendCanvasSizeP1", { gameId: this.gameData.id, width: this.context.canvas.width, height: this.context.canvas.height });
			else
				this.socket.emit("sendCanvasSizeP2", { gameId: this.gameData.id, width: this.context.canvas.width, height: this.context.canvas.height });
		},

		replay() {
			this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
			this.btnOnePlayer = true;
			this.btnMultiPlayer = true;
			this.btnQuitGame = false;
		},

		menuOfEnd() {
			this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
			this.updatecsore();
			this.score.finish_game = 1;
			this.ball.speed = this.gameData.ballSpeed;
			this.player2.speed = this.gameData.paddleSpeed;
			this.player1.speed = this.gameData.paddleSpeed;
			this.context.font = '25px arial';
			this.context.textAlign = 'center'; // Center the text horizontally
			this.context.textBaseline = 'middle'; // Center the text vertically
			const yOffset = 50; // Adjust the vertical offset as needed
			const textY = this.context.canvas.height / 2 - yOffset;
			if (this.score.p1 == this.score.max_score && this.player1.me == 1) {
				this.context.fillText("Bravo vous avez gagné", this.context.canvas.width / 2, textY);
			}
			else if (this.score.p2 == this.score.max_score && this.player2.me == 1) {
				this.context.fillText("Bravo vous avez gagné", this.context.canvas.width / 2, textY);
			}
			else {
				this.context.fillText("Vous avez perdu", this.context.canvas.width / 2, textY);
			}
			if (!this.gameDataUpdated.games)
				return ;
			if (this.score.noWinner == 0 && this.gameDataUpdated.games.userGames.length == 2) {
					if (this.score.p1 == this.score.max_score) {
						this.gameDataUpdated.games.userGames[0].status = userGameStatus.WINNER;
						this.gameDataUpdated.games.userGames[1].status = userGameStatus.LOSER;
					}
					else if (this.score.p2 == this.score.max_score) {
						this.gameDataUpdated.games.userGames[0].status = userGameStatus.LOSER;
						this.gameDataUpdated.games.userGames[1].status = userGameStatus.WINNER;
					}
					else {
						this.gameDataUpdated.games.userGames[0].status = userGameStatus.DRAW;
						this.gameDataUpdated.games.userGames[1].status = userGameStatus.DRAW;
					}
					endGame(this.gameDataUpdated.games.id, this.gameDataUpdated.games.userGames).catch((err) => {
						const alert = {
							status: err.response.status,
							message: err.response.data.message,
						} as AlertInterface;
						this.alertStore.setAlert(alert);
						router.push({
							name: "games",
						});
					});
			} else if (this.gameDataUpdated.games.userGames.length == 1) {
				endGame(this.gameDataUpdated.games.id, this.gameDataUpdated.games.userGames).catch((err) => {
					const alert = {
						status: err.response.status,
						message: err.response.data.message,
					} as AlertInterface;
					this.alertStore.setAlert(alert);
					router.push({
						name: "games",
					});
				});	
			}
			if (this.score.noWinner == 1 && this.gameDataUpdated.games.userGames.length == 2)
			{
				endGame(this.gameDataUpdated.games.id, this.gameDataUpdated.games.userGames).catch((err) => {
					const alert = {
						status: err.response.status,
						message: err.response.data.message,
					} as AlertInterface;
					this.alertStore.setAlert(alert);
					router.push({
						name: "games",
					});
				});	
			}
			this.player1.me = 0;
			this.player2.me = 0;
			this.cpu.enable = 0;
			this.score.p1 = 0;
			this.score.p2 = 0;
			this.isReady = 0;
			this.score.noWinner = 0;
			
			this.btnOnePlayer = false;
			this.btnMultiPlayer = false;
			this.btnQuitGame = true;
			router.push({
					name: "games",
			});
		},

		resizeVar() {
			this.player1.tile = (this.context.canvas.height * this.gameData.paddleSize) / 650;
			this.player2.tile = (this.context.canvas.height * this.gameData.paddleSize) / 650;
			this.ball.width = (this.context.canvas.width * this.gameData.ballSize) / 650;
		},

		setvar() {
			this.score.max_score = this.gameData.scoreLimit;
			this.ball.width = this.gameData.ballSize;
			this.ball.speed = this.gameData.ballSpeed;
			this.player2.tile = this.gameData.paddleSize;
			this.player2.speed = this.gameData.paddleSpeed;
			this.player1.tile = this.gameData.paddleSize;
			this.player1.speed = this.gameData.paddleSpeed;
		},

		movecpu(player: Player) {
			player.speed = this.cpu.difficulty;
			if (player.y < this.ball.y && player.paddley < this.ball.y) {
				if ((player.y - player.speed) >= (this.context.canvas.height - (player.tile + 25))) {
					player.y = this.context.canvas.height - player.tile;
					player.paddley = player.y + player.tile;
				}
				else {
					player.y += player.speed;
					player.paddley = player.y + player.tile;
				}
			}
			else if (player.y > this.ball.y && player.paddley > this.ball.y) {
				if ((player.y - player.speed) <= 0) {
					player.y = 0;
					player.paddley = player.y + player.tile;
				}
				else {
					player.y -= player.speed;
					player.paddley = player.y + player.tile;
				}
			}
		},

		respawnball() {
			this.ball.x = this.ball.xb;
			this.ball.y = this.ball.yb;
			this.ball.rebound = 0;
			this.ball.rebonetime = 2;
			this.ball.speed = this.gameData.ballSpeed;
			this.player2.speed = this.gameData.paddleSpeed;
			this.player1.speed = this.gameData.paddleSpeed;
		},

		movePlayerFonctionOne(event: KeyboardEvent) {
			let up = "w";
			let down = "s";
			switch (event.key) {
				case down:
					if ((this.player1.y + this.player1.speed) >= (this.context.canvas.height - (this.player1.tile))) {
						this.player1.y = this.context.canvas.height - this.player1.tile;
						this.player1.paddley = this.player1.y + this.player1.tile;
					}
					else {
						this.player1.y = this.player1.y + this.player1.speed;
						this.player1.paddley = this.player1.y + this.player1.tile;
					}
					this.socket.emit("movePlayer", { gameId: this.gameData.id, userId: this.userStore.user.id, position: { x: this.player1.x, y: (this.player1.y * this.player2.ratioY), }, });
					break;
				case up:
					if ((this.player1.y - this.player1.speed) <= 0) {
						this.player1.y = 0;
						this.player1.paddley = this.player1.y + this.player1.tile;
					}
					else {
						this.player1.y = this.player1.y - this.player1.speed;
						this.player1.paddley = this.player1.y + this.player1.tile;
					}
					this.socket.emit("movePlayer", { gameId: this.gameData.id, userId: this.userStore.user.id, position: { x: this.player1.x, y: (this.player1.y * this.player2.ratioY), }, });
					break;
				default:
					return;
			}
		},

		movePlayerFonctionTwo(event: KeyboardEvent) {
			let up = "w";
			let down = "s";
			switch (event.key) {
				case down:
					if ((this.player2.y + this.player2.speed) >= (this.context.canvas.height - (this.player2.tile))) {
						this.player2.y = this.context.canvas.height - this.player2.tile;
						this.player2.paddley = this.player2.y + this.player2.tile;
					}
					else {
						this.player2.y = this.player2.y + this.player2.speed;
						this.player2.paddley = this.player2.y + this.player2.tile;
					}
					if (this.player1.canvasY > this.context.canvas.height)
						this.socket.emit("movePlayerTwo", { gameId: this.gameData.id, userId: this.userStore.user.id, position: { x: this.player2.x, y: this.player2.y * this.player2.ratioY, }, });
					else
						this.socket.emit("movePlayerTwo", { gameId: this.gameData.id, userId: this.userStore.user.id, position: { x: this.player2.x, y: this.player2.y * (this.player1.canvasY / this.context.canvas.height), }, });
					break;
				case up:
					if ((this.player2.y - this.player2.speed) <= 0) {
						this.player2.y = 0;
						this.player2.paddley = this.player2.y + this.player2.tile;
					}
					else {
						this.player2.y = this.player2.y - this.player2.speed;
						this.player2.paddley = this.player2.y + this.player2.tile;
					}
					if (this.player1.canvasY > this.context.canvas.height)
						this.socket.emit("movePlayerTwo", { gameId: this.gameData.id, userId: this.userStore.user.id, position: { x: this.player2.x, y: this.player2.y * this.player2.ratioY, }, });
					else
						this.socket.emit("movePlayerTwo", { gameId: this.gameData.id, userId: this.userStore.user.id, position: { x: this.player2.x, y: this.player2.y * (this.player1.canvasY / this.context.canvas.height), }, });
					break;
				default:
					return;
			}
		},

		movePlayerOne(player: Player) {
			window.addEventListener("keypress", this.movePlayerFonctionOne);
		},

		movePlayerTwo(player: Player) {
			window.addEventListener("keypress", this.movePlayerFonctionTwo);
		},


		updatecsore() {
			// color the background
			this.context.fillStyle = this.gameData.backgroundColor;
			this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
			// Putting the middle line
			this.themecolor();
			this.context.fillStyle = this.score.color;
			this.context.font = '12px arial';
			this.context.fillRect(this.context.canvas.width / 2, 0, 1, this.context.canvas.height);
			if (this.player1.me == 1)
				this.context.fillText("Vous jouez à gauche", this.context.canvas.width / 2 - 120, this.context.canvas.height - 10);
			else
				this.context.fillText("Vous jouez à droite", this.context.canvas.width / 2 + 10, this.context.canvas.height - 10);
			this.context.fillText("Commande : W = haut | S = en bas", 20, 20);
			// Draw score & update
			this.context.font = '48px arial';
			this.context.fillText(this.score.p1, this.context.canvas.width / 2 - 41 - 10, 50);
			this.context.fillText(this.score.p2, this.context.canvas.width / 2 + 25, 50);
			if (this.gameData.userGames.length == 2) {
				// Set gameData
					this.gameData.userGames[0].score = this.score.p1;
					this.gameData.userGames[1].score = this.score.p2;
			}
		},

		updateball() {
			// calcul where the ball is and if she touch something
			if (this.ball.x + this.ball.velocityx + this.ball.width >= this.context.canvas.width) {
				this.respawnball();
				this.score.p1++;
				this.socket.emit("updateScore", { gameId: this.gameData.id, score: this.score });
			}
			else if (this.ball.x - this.ball.velocityx <= 0) {
				this.respawnball();
				this.score.p2++;
				this.socket.emit("updateScore", { gameId: this.gameData.id, score: this.score });
			}
			else if (this.ball.x + this.ball.velocityx + this.ball.width >= this.player2.x) {
				if ((this.ball.y >= this.player2.y && this.ball.y <= this.player2.paddley)
					|| (this.ball.y + this.ball.width >= this.player2.y && this.ball.y + this.ball.width <= this.player2.paddley)) {
					if (this.ball.rebonetime == 0 || this.ball.rebonetime == 2) {
						if (++this.ball.rebound % 3 == 0) {
							this.player1.speed++;
							this.player2.speed++;
							this.ball.speed++;
						}
						this.ball.rebonetime = 1;
					}
					this.ball.velocityx = -1;
				}
			}
			else if ((this.ball.x - this.player1.tilewidth) - this.ball.velocityx <= this.player1.x) {
				if ((this.ball.y >= this.player1.y && this.ball.y <= this.player1.paddley)
					|| (this.ball.y + this.ball.width >= this.player1.y && this.ball.y + this.ball.width <= this.player1.paddley)) {
					if (this.ball.rebonetime == 1 || this.ball.rebonetime == 2) {
						if (++this.ball.rebound % 3 == 0) {
							this.player1.speed++;
							this.player2.speed++;
							this.ball.speed++;
						}
						this.ball.rebonetime = 0;
					}
					this.ball.velocityx = 1;
				}
			}
			else
				;
			// check the collision on the Y axe
			if (this.ball.y + this.ball.velocityy + this.ball.width >= this.context.canvas.height) {
				this.ball.velocityy = -1;
			}
			else if (this.ball.y - this.ball.velocityy <= 0) {
				this.ball.velocityy = 1;
			}
			else
				;
			this.ball.x += this.ball.velocityx * this.ball.speed;
			this.ball.y += this.ball.velocityy * this.ball.speed;
			this.socket.emit("moveBall", { gameId: this.gameData.id, x: (this.ball.x * this.player2.ratioX), y: (this.ball.y * this.player2.ratioY) });
		},

		redrawall() {
			this.context.fillStyle = this.gameData.paddleColor;
			if (this.player2.me == 1) {
				this.context.fillRect(this.player1.x, this.player1.y * this.player1.ratioY, this.player1.tilewidth, this.player1.tile);
				this.context.fillRect(this.player2.x, this.player2.y, this.player2.tilewidth, this.player2.tile);

				this.context.fillStyle = this.gameData.ballColor;
				this.context.beginPath();
				this.context.arc((this.ball.x * this.player1.ratioX) + this.ball.width / 2, (this.ball.y * this.player1.ratioY) + this.ball.width / 2, this.ball.width / 2, 0, 2 * Math.PI);
				this.context.fill();
			}
			else {
				this.context.fillRect(this.player1.x, this.player1.y, this.player1.tilewidth, this.player1.tile);
				this.context.fillRect(this.player2.x, this.player2.y, this.player2.tilewidth, this.player2.tile);

				this.context.fillStyle = this.gameData.ballColor;
				this.context.beginPath();
				this.context.arc(this.ball.x + this.ball.width / 2, this.ball.y + this.ball.width / 2, this.ball.width / 2, 0, 2 * Math.PI);
				this.context.fill();
			}
		},

		calculateRatioPlayerOne() {
			if (this.player2.canvasY > this.context.canvas.height) {
				this.player1.ratioY = this.context.canvas.height / this.player2.canvasY;
				this.player2.ratioY = this.player2.canvasY / this.context.canvas.height;
			}
			else {
				this.player1.ratioY = 1;
				this.player2.ratioY = 1;
			}
			if (this.player2.canvasX > this.context.canvas.width) {
				this.player1.ratioX = this.context.canvas.width / this.player2.canvasX;
				this.player2.ratioX = this.player2.canvasX / this.context.canvas.width;
			}
			else {
				this.player1.ratioX = 1;
				this.player2.ratioX = 1;
			}
		},

		calculateRatioPlayerTwo() {
			if (this.player1.canvasY > this.context.canvas.height) {
				this.player1.ratioY = this.context.canvas.height / this.player1.canvasY;
				this.player2.ratioY = this.player1.canvasY / this.context.canvas.height;
			}
			else {
				this.player1.ratioY = 1;
				this.player2.ratioY = 1;
			}
			if (this.player1.canvasX > this.context.canvas.width) {
				this.player1.ratioX = this.context.canvas.width / this.player1.canvasX;
				this.player2.ratioX = this.player1.canvasX / this.context.canvas.width;
			}
			else {
				this.player1.ratioX = 1;
				this.player2.ratioX = 1;
			}
		},

		update() {
			if (this.btnMultiPlayer == true && this.cpu.enable == 1) {
				this.cpu.enable = 0;
				this.ball.x = this.ball.xb
				this.ball.y = this.ball.yb
				this.score.p1 = 0;
				this.score.p2 = 0;
			}
			if (this.player2.me == 1 && this.score.none_same == 1)
			{
				this.socket.emit("updateScore", { gameId: this.gameData.id, score: this.score });
				this.score.none_same = 0;
			}
			if (this.score.max_score == this.score.p1 || this.score.max_score == this.score.p2)
				this.menuOfEnd();
			else if ((this.isReady == 2 || this.cpu.enable == 1) && (this.player1.me == 1 || this.player2.me == 1)) {
				this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
				this.updatecsore();
				if (this.player1.me == 1) {
					this.calculateRatioPlayerOne()
					this.movePlayerOne(this.player1);
					this.updateball();
				}
				if (this.player2.me == 1) {
					this.calculateRatioPlayerTwo()
					this.movePlayerTwo(this.player2);
				}
				if (this.cpu.enable == 1)
					this.movecpu(this.player2);
				this.redrawall();
			}
			if (this.score.finish_game == 0)
				this.ball.animation = window.requestAnimationFrame(this.update);
		},

		themecolor() {
			// choose the color by the theme
			let body = document.getElementsByTagName('body')[0];
			if (body.classList.contains("dark"))
				this.score.color = 'white';
			else
				this.score.color = 'black';
		},

		createbackground() {
			let canvas = document.getElementById('Field') as HTMLCanvasElement;
			this.context = canvas?.getContext('2d');
			this.context.canvas.width = window.innerWidth - 145;
			this.context.canvas.height = window.innerHeight - 40;
			this.ball.xb = (window.innerWidth - 145) / 2;
			this.ball.yb = (window.innerHeight - 40) / 2;
			this.themecolor();
		},

		redrawPlayers() {
			this.context.clearRect(this.player1.x, 0, this.player1.tilewidth, this.context.canvas.height);
			this.context.clearRect(this.player2.x, 0, this.player2.tilewidth, this.context.canvas.height);
			this.context.fillRect(this.player1.x, this.player1.y, this.player1.tilewidth, this.player1.tile);
			this.context.fillRect(this.player2.x, this.player2.y, this.player2.tilewidth, this.player2.tile);
		},

		handleWindowResize() {
			this.createbackground();
			this.player1.y = this.context.canvas.height / 2 - 25;
			this.player1.paddley = this.player1.y + this.player1.tile;
			this.player2.x = this.context.canvas.width - 20; // Update the x position of player2
			this.player2.y = this.context.canvas.height / 2 - 25;
			this.player2.paddley = this.player2.y + this.player2.tile;
			this.ball.x = this.ball.xb;
			this.ball.y = this.ball.yb;
			this.resizeVar();
			if (this.player1.me == 1)
				this.socket.emit("sendCanvasSizeP1", { gameId: this.gameData.id, width: this.context.canvas.width, height: this.context.canvas.height });
			else
				this.socket.emit("sendCanvasSizeP2", { gameId: this.gameData.id, width: this.context.canvas.width, height: this.context.canvas.height });
			this.redrawPlayers();
		},
	},
});
</script>

<style scoped lang="scss">
#Field {
	border: 3px solid;
	border-radius: 30px;

	@media screen and (max-width: 768px) {
		width: 100%;
		max-height: calc(var(--vh) * 85);
	}
}

.field-view-container {
	position: relative;

	&__game-zone {
		.game-buttons {
			position: absolute;
			height: 3rem;
			display: flex;
			justify-content: center;
			margin-bottom: 1rem;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			.btn {

				&:not(:last-child) {
					margin-right: 1rem;
				}
			}
		}
	}
}
</style>