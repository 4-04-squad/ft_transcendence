<template>
	<div class="field-view-container" ref="container">
		<div class="field-view-container__game-zone">
			<div class="game-buttons">
				<button v-if="btnOnePlayer" @click="oneplayer" class="btn">partie solo</button>

				<button v-if="btnMultiPlayer" @click="multiplayer" class="btn">partie multijoueur</button>

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
import { endGame } from "@/services/gameServices";
import { useAlertStore } from "@/stores/alert";
import { useUserStore } from "@/stores/user";
import { defineComponent, ref, watch } from "vue";

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
	setup(props) {
		const userStore = useUserStore();
		const alertStore = useAlertStore();
		let context = {} as any;
		
		const btnOnePlayer = ref(true);
		const btnMultiPlayer = ref(false);
		const btnQuitGame = ref(false);
		const isReady = ref(0);

		watch(
			() => props.gameData.users,
			() => {
				if (props.gameData.users.length == 2) {
					if (props.gameData.users[0].id == userStore.user.id || props.gameData.users[1].id == userStore.user.id) {
						btnOnePlayer.value = props.gameData.users.length == 1 ? true : false
						btnMultiPlayer.value = props.gameData.users.length == 1 ? false : true
					}
				} else {
					if (props.gameData.users[0].id == userStore.user.id) {
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
			speed: 1,
		};

		const cpu: CPU = {
			enable: 0,
			difficulty: 3,
		};

		const score: Score = {
			p1: 0,
			p2: 0,
			color: 'white',
			max_score: 105,
			finish_game: 0,
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
			ratioY: 0,
			ratioX: 0,
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
			ratioY: 0,
			ratioX: 0,
		};
		// Socket event listeners envoyer les infos au serveur
		props.socket.on("joinGame", (data: any) => {
			//console.log("User joined game:", data);
			if (props.gameData.userGames.length == 2) {
				btnOnePlayer.value = false;
				btnMultiPlayer.value = true;
			}
		});

		props.socket.on("leaveGame", (data: any) => {
			//console.log("User left game:", data);
		});

		props.socket.on("movePlayer", (data: any) => {
			//console.log("Player moved:", data);
			if (player1.me == 0)
			{
				player1.y = data.position.y;
				player1.paddley = data.position.y + player1.tile;
			}
		});

		props.socket.on("movePlayerTwo", (data: any) => {
			//console.log("Player Two moved:", data);
			if (player2.me == 0)
			{
				player2.y = data.position.y;
				player2.paddley = data.position.y + player2.tile;
			}
		});

		props.socket.on("moveBall", (data: any) => {
			//console.log("Ball moved:", data);
			if (player1.me == 0)
			{
				ball.x = data.x;
				ball.y = data.y;
			}
		});

		props.socket.on("updateScore", (data: any) => {
			//console.log("Score updated:", data);
			score.p1 = data.score.p1;
			score.p2 = data.score.p2;
		});

		props.socket.on("ready", (data: any) => {
			isReady.value++;
			console.log("Ready:", isReady.value);
		});

		props.socket.on("sendCanvasSizeP1", (data: any) => {
			//console.log("data:", data.width, data.height);
			player1.canvasX = data.width;
			player1.canvasY = data.height;
		});

		props.socket.on("sendCanvasSizeP2", (data: any) => {
			//console.log("data:", data.width, data.height);
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
		}
	},
	beforeUnmount() {
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
		this.resizeVar();
		window.requestAnimationFrame(this.update);
		window.addEventListener("resize", this.handleWindowResize);
	},
	methods: {
		oneplayer() {
			this.btnOnePlayer = false;
			this.btnMultiPlayer = false;
			this.player1.me = 1;
			this.cpu.enable = 1;
			this.player2.ready = 1;
		},

		multiplayer() {
			this.btnOnePlayer = false;
			this.btnMultiPlayer = false;
			if (this.gameData.userGames.length == 2) {
				if (this.gameData.userGames[0].userId == this.userStore.user.id) {
					this.firstplayer(this.gameData.userGames[0].userId);
					this.secondplayer(this.gameData.userGames[1].userId);
				} else {
					this.firstplayer(this.gameData.userGames[1].userId);
					this.secondplayer(this.gameData.userGames[0].userId);
				}
			}
			this.socket.emit("ready", { gameId: this.gameData.id, userId: this.userStore.user.id });
			if (this.player1.me == 1)
				this.socket.emit("sendCanvasSizeP1", { gameId: this.gameData.gameId, width: this.context.canvas.width, height: this.context.canvas.height});
			else
				this.socket.emit("sendCanvasSizeP2", { gameId: this.gameData.gameId, width: this.context.canvas.width, height: this.context.canvas.height});
		},

		firstplayer(id: string) {
			if (this.gameData.userGames[0].userId == id) {
				this.player1.me = 1;
			} else {
				this.player1.me = 0;
			}
			this.player1.id = id;
		},

		secondplayer(id: string) {
			if (this.gameData.userGames[1].userId == id) {
				this.player2.me = 0;
			} else {
				this.player2.me = 1;
			}
			this.player2.id = id;
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

			if (this.gameData.userGames.length == 2) {
				if (this.score.p1 == this.score.max_score && this.player1.me == 1) {
					this.gameData.userGames[0].status = userGameStatus.WINNER;
					this.gameData.userGames[1].status = userGameStatus.LOSER;
				}
				else if (this.score.p2 == this.score.max_score && this.player2.me == 1) {
					this.gameData.userGames[0].status = userGameStatus.LOSER;
					this.gameData.userGames[1].status = userGameStatus.WINNER;
				}
				else {
					this.gameData.userGames[0].status = userGameStatus.DRAW;
					this.gameData.userGames[1].status = userGameStatus.DRAW;
				}
				endGame(this.gameData.id, this.gameData.userGames).catch((err) => {
					const alert = {
						status: err.response.status,
						message: err.response.data.message,
					} as AlertInterface;

					this.alertStore.setAlert(alert);
					router.push({
						name: "games",
					});
				});
			} else if (this.gameData.userGames.length == 1) {
				if (this.score.p1 == this.score.max_score && this.player1.me == 1) {
					this.gameData.userGames[0].status = userGameStatus.WINNER;
				}
				else {
					this.gameData.userGames[0].status = userGameStatus.LOSER;
				}
			}

			this.player1.me = 0;
			this.player2.me = 0;
			this.cpu.enable = 0;
			this.score.p1 = 0;
			this.score.p2 = 0;
			this.btnOnePlayer = false;
			this.btnMultiPlayer = false;
			this.btnQuitGame = true;
		},

		resizeVar() {
			this.player1.tile = (this.context.canvas.height * 75) / 650;
			this.player2.tile = (this.context.canvas.height * 75) / 650;
			this.ball.width = (this.context.canvas.width * 15) / 650;
		},

		setvar() {
			this.score.max_score = this.gameData.scoreLimit;
			this.ball.width = this.gameData.ballSize;
			this.ball.speed = this.gameData.ballSpeed;
			this.cpu.difficulty = this.gameData.paddleSpeed;
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
					this.socket.emit("movePlayer", { userId: this.gameData.userId, position: { x: this.player1.x, y: (this.player1.y * this.player2.ratioY), }, });
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
					this.socket.emit("movePlayer", { userId: this.gameData.userId, position: { x: this.player1.x, y: (this.player1.y * this.player2.ratioY), }, });
					break;
				default:
					return;
			}
		},

		movePlayerFonctionTwo(event: KeyboardEvent) {
			let up = "c";
			let down = "v";
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
						this.socket.emit("movePlayerTwo", { userId: this.gameData.userId, position: { x: this.player2.x, y: this.player2.y * this.player2.ratioY, }, });
					else
						this.socket.emit("movePlayerTwo", { userId: this.gameData.userId, position: { x: this.player2.x, y: this.player2.y * (this.player1.canvasY / this.context.canvas.height), }, });
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
						this.socket.emit("movePlayerTwo", { userId: this.gameData.userId, position: { x: this.player2.x, y: this.player2.y * this.player2.ratioY, }, });
					else
						this.socket.emit("movePlayerTwo", { userId: this.gameData.userId, position: { x: this.player2.x, y: this.player2.y * (this.player1.canvasY / this.context.canvas.height), }, });
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
			this.context.fillRect(this.context.canvas.width / 2, 0, 1, this.context.canvas.height);
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
				this.socket.emit("updateScore", { gameId: this.gameData.gameId, score: this.score });
			}
			else if (this.ball.x - this.ball.velocityx <= 0) {
				this.respawnball();
				this.score.p2++;
				this.socket.emit("updateScore", { gameId: this.gameData.gameId, score: this.score });
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
			this.socket.emit("moveBall", { gameId: this.gameData.gameId, x: this.ball.x, y: this.ball.y });
		},

		redrawall() {
			this.context.fillStyle = this.gameData.paddleColor;

			if (this.player2.me == 1)
			{
				this.context.fillRect(this.player1.x, this.player1.y * this.player1.ratioY, this.player1.tilewidth, this.player1.tile);
				this.context.fillRect(this.player2.x, this.player2.y, this.player2.tilewidth, this.player2.tile);

				this.context.fillStyle = this.gameData.ballColor;
				this.context.beginPath();
				this.context.arc((this.ball.x * this.player1.ratioX) + this.ball.width / 2, (this.ball.y * this.player1.ratioY) + this.ball.width / 2, this.ball.width / 2, 0, 2 * Math.PI);
				this.context.fill();
			}
			else
			{
				this.context.fillRect(this.player1.x, this.player1.y, this.player1.tilewidth, this.player1.tile);
				this.context.fillRect(this.player2.x, this.player2.y, this.player2.tilewidth, this.player2.tile);

				this.context.fillStyle = this.gameData.ballColor;
				this.context.beginPath();
				this.context.arc(this.ball.x + this.ball.width / 2, this.ball.y + this.ball.width / 2, this.ball.width / 2, 0, 2 * Math.PI);
				this.context.fill();
			}
		},

		calculateRatioPlayerOne() {
			if (this.player2.canvasY > this.context.canvas.height)
			{
				this.player1.ratioY = this.context.canvas.height / this.player2.canvasY;
				this.player2.ratioY = this.player2.canvasY / this.context.canvas.height;
			}
			else
			{
				this.player1.ratioY = 1;
				this.player2.ratioY = 1;
			}
			if (this.player2.canvasX > this.context.canvas.width)
			{
				this.player1.ratioX = this.context.canvas.width / this.player2.canvasX;
				this.player2.ratioX = this.player2.canvasX / this.context.canvas.width;
			}
			else
			{
				this.player1.ratioX = 1;
				this.player2.ratioX = 1;
			}
		},

		calculateRatioPlayerTwo() {
			if (this.player1.canvasY > this.context.canvas.height)
			{
				this.player1.ratioY = this.context.canvas.height / this.player1.canvasY;
				this.player2.ratioY = this.player1.canvasY / this.context.canvas.height;
			}
			else
			{
				this.player1.ratioY = 1;
				this.player2.ratioY = 1;
			}
			if (this.player1.canvasX > this.context.canvas.width)
			{
				this.player1.ratioX = this.context.canvas.width / this.player1.canvasX;
				this.player2.ratioX = this.player1.canvasX / this.context.canvas.width;
			}
			else
			{
				this.player1.ratioX = 1;
				this.player2.ratioX = 1;
			}
		},


		update() {
			//this.setvar();
			//console.log(this.settings.paddleSpeed, this.player1.tile, this.player1.speed, this.player1.y, this.player2.tile, this.player2.speed, this.player2.y);
			if (this.score.max_score == this.score.p1 || this.score.max_score == this.score.p2)
				this.menuOfEnd();
			else if (this.isReady == 2 && (this.player1.me == 1 || this.player2.me == 1)) {
				this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
				this.updatecsore();
				if (this.player1.me == 1) {
					this.movePlayerOne(this.player1);
					this.updateball();
				}
				if (this.player2.me == 1)
					this.movePlayerTwo(this.player2);
				if (this.cpu.enable == 1)
					this.movecpu(this.player2);
				this.redrawall();
			}
			if (this.score.finish_game == 0)
				window.requestAnimationFrame(this.update);
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
			this.resizeVar();
			if (this.player1.me == 1)
				this.socket.emit("sendCanvasSizeP1", { gameId: this.gameData.gameId, width: this.context.canvas.width, height: this.context.canvas.height});
			else
				this.socket.emit("sendCanvasSizeP2", { gameId: this.gameData.gameId, width: this.context.canvas.width, height: this.context.canvas.height});
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