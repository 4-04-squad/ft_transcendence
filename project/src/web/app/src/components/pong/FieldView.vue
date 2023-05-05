<template>
	<div class="field-view-container">
		<div class="field-view-container__game-zone">
			<div style="position:absolute; left: 45%; top: 40%;">
				<button v-if="btn1" @click="oneplayer" class="btn">partie solo</button>
			</div>
			<div style="position:absolute; left: 45%; top: 50%;">
				<button v-if="btn2" @click="multiplayer" class="btn">partie multijoueur</button>
			</div>
			<div style="position:absolute; left: 45%; top: 40%;">
				<button v-if="btn3" @click="firstplayer" class="btn">joueur gauche</button>
			</div>
			<div style="position:absolute; left: 45%; top: 50%;">
				<button v-if="btn4" @click="secondplayer" class="btn">joueur droite</button>
			</div>
			<canvas id="Field" ref="Field">
			</canvas>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

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
		let btn1 = true
		let btn2 = true
		let btn3 = false
		let btn4 = false
		return {
			btn1,
			btn2,
			btn3,
			btn4,
		}
	},
	setup(props) {
		let context = {}
		let ball = {
			xb: (window.innerWidth - 260) / 2 - 10,
			yb: (window.innerHeight - 145) / 2,
			x: 0,
			y: 0,
			width: 20,
			velocityx: 1,
			velocityy: 1,
			rebound: 0,
			rebonetime: 2,
			speed: 3
		}
		let cpu = {
			enable: 0,
			difficulty: 3,
		}
		let score = {
			p1: 0,
			p2: 0,
			max_score: 9
		}
		let player1 = {
			me: 0,
			speed: 10,
			tile: 75,
			tilewidth: 10,
			x: 0,
			y: 0,
			paddley: 0,
			ply: 1
		}
		let player2 = {
			me: 0,
			speed: 10,
			tile: 75,
			tilewidth: 10,
			x: 0,
			y: 0,
			paddley: 0,
			ply: 2
		}
		let p2ball = {
			x: 0,
			y: 0
		}
		// Socket event listeners envoyer les infos au serveur
		props.socket.on("joinGame", (data) => {
			console.log("User joined game:", data);
		});
		props.socket.on("leaveGame", (data) => {
			console.log("User left game:", data);
		});
		props.socket.on("movePlayer", (data) => {
			console.log("Player moved:", data);
			if (data.userId === player1Id) {
				player1.y = data.position.y;
				player1.paddley = player1.y + player1.tile;
			} else if (data.userId === player2Id) {
				player2.y = data.position.y;
				player2.paddley = player2.y + player2.tile;
			}
		});
		props.socket.on("moveBall", (data) => {
			console.log("Ball moved:", data);
			ball.x = data.x;
    		ball.y = data.y;
		});
		props.socket.on("getBall", (data) => {
			console.log("Ball moved:", data);
			ball.x = data.x;
    		ball.y = data.y;
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
			p2ball
		}
	},
	beforeUnmount() {
		window.removeEventListener("resize", this.handleWindowResize);
		window.removeEventListener("keydown", this.moveplayer); // You'll need to update moveplayer to use a named function instead of an anonymous function
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

		window.requestAnimationFrame(this.update);
		window.addEventListener("resize", this.handleWindowResize);
	},
	methods: {
		oneplayer() {
      		this.btn1 = false;
			this.btn2 = false;
			this.player1.me = 1;
			this.cpu.enable = 1;
    	},
		multiplayer() {
			this.btn1 = false;
      		this.btn2 = false;
			this.btn3 = true;
			this.btn4 = true;
    	},
		firstplayer() {
			this.btn3 = false;
			this.btn4 = false;
			this.player1.me = 1;
		},
		secondplayer() {
			this.btn3 = false;
			this.btn4 = false;
			this.player2.me = 1;
		},

		movecpu(player: Object) {
			player.speed = this.cpu.difficulty;
			this.context.fillRect(player.x, player.y, player.tilewidth, player.tile);
			if (player.y < this.ball.y && player.paddley < this.ball.y)
			{
				this.context.clearRect(player.x, 0, 10, this.context.canvas.height);
				if ((player.y - player.speed) >= (this.context.canvas.height - (player.tile + 25))) {
					player.y = this.context.canvas.height - player.tile;
					player.paddley = player.y + player.tile;
				}
				else {
					player.y += player.speed;
					player.paddley = player.y + player.tile;
				}
			}
			else if (player.y > this.ball.y && player.paddley > this.ball.y)
			{
				this.context.clearRect(player.x, 0, 10, this.context.canvas.height);
				if ((player.y - player.speed) <= 0) {
					player.y = 0;
					player.paddley = player.y + player.tile;
				}
				else {
					player.y -= player.speed;
					player.paddley = player.y + player.tile;
				}
			}
 			// cette ligne permet de dessiner le joueur a sa nouvelle position mais pas dans cette fonction
			this.context.fillRect(player.x, player.y, player.tilewidth, player.tile);
		},

		moveplayer(player: Object) {
			this.context.fillRect(player.x, player.y, player.tilewidth, player.tile);
			let up = "w";
			let down = "s";
			if (player.ply == 2) {
				up = "ArrowUp";
				down = "ArrowDown";
			}
			window.addEventListener("keydown", (event) => {
				if (event.defaultPrevented) {
					return;
				}
				switch (event.key) {
					case down:
						this.context.clearRect(player.x, 0, 10, this.context.canvas.height);
						if ((player.y - player.speed) >= (this.context.canvas.height - (player.tile + 25))) {
							player.y = this.context.canvas.height - player.tile;
							player.paddley = player.y + player.tile;
						}
						else {
							player.y += player.speed;
							player.paddley = player.y + player.tile;
						}
						break;
					case up:
						this.context.clearRect(player.x, 0, 10, this.context.canvas.height);
						if ((player.y - player.speed) <= 0) {
							player.y = 0;
							player.paddley = player.y + player.tile;
						}
						else {
							player.y -= player.speed;
							player.paddley = player.y + player.tile;
						}
						break;
					default:
						return;
				}
				event.preventDefault();
				// Send player movement to server
				this.socket.emit("movePlayer", {
					userId: this.gameData.userId,
					position: {
						x: player.x,
						y: player.y,
					},
				});
				// cette ligne permet de dessiner le joueur a sa nouvelle position mais pas dans cette fonction
				this.context.fillRect(player.x, player.y, player.tilewidth, player.tile);
			},
			);
		},
		respawnball() {
			this.ball.x = this.ball.xb;
			this.ball.y = this.ball.yb;
			this.ball.speed = 3;
			this.ball.rebound = 0;
			this.ball.rebonetime = 2;
			this.player1.speed = 10;
			this.player2.speed = 10;
		},
		updatecsore() {
			// Putting the middle line
			this.context.fillRect(this.context.canvas.width / 2, 0, 1, this.context.canvas.height);
			// Draw score & update
			this.context.font = '48px arial';
			this.context.fillText(this.score.p1, this.context.canvas.width / 2 - 41 - 10, 50);
			this.context.fillText(this.score.p2, this.context.canvas.width / 2 + 25, 50);
		},
		updateball() {
			// calcul where the ball is and if she touch something
			if (this.ball.x + this.ball.velocityx + this.ball.width >= this.context.canvas.width) {
				this.respawnball();
				this.score.p1++;
			}
			else if (this.ball.x - this.ball.velocityx <= 0) {
				this.respawnball();
				this.score.p2++;
			}
			else if (this.ball.x + this.ball.velocityx + this.ball.width >= this.player2.x) {
				if ((this.ball.y >= this.player2.y && this.ball.y <= this.player2.paddley)
					|| (this.ball.y + this.ball.width >= this.player2.y && this.ball.y + this.ball.width <= this.player2.paddley)) {
					if (this.ball.rebonetime == 0 || this.ball.rebonetime == 2)
					{
						if (++this.ball.rebound % 3 == 0)
						{
							this.player1.speed++;
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
					if (this.ball.rebonetime == 1 || this.ball.rebonetime == 2)
					{
						if (++this.ball.rebound % 3 == 0)
						{
							this.player1.speed++;
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
			if (this.ball.y + this.ball.velocityy + this.ball.width >= this.context.canvas.height)
			{
				this.ball.velocityy = -1;
			}
			else if (this.ball.y - this.ball.velocityy <= 0)
			{
				this.ball.velocityy = 1;
			}
			else
				;
			this.ball.x += this.ball.velocityx * this.ball.speed;
			this.ball.y += this.ball.velocityy * this.ball.speed;
			// socket to send the ball position to the other player
			this.socket.emit("moveBall", { gameId: this.gameData.gameId, x: this.ball.x, y: this.ball.y });
			this.socket.emit("getBall", { gameId: this.gameData.gameId, x: this.ball.x, y: this.ball.y });
			// Cette fonction doit être appelé à chaque fois que la position de la balle change	mais pas dans cette fonction
			this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.width);
		},

		updateplayertwo() {

		},

		updateplayeroneandball() {
			this.socket.emit("getBall", {gameId: this.gameData.gameId, x: this.ball.x, y: this.ball.y});
			console.log(this.ball.x);
			console.log(this.ball.y);
			// Cette fonction doit être appelé à chaque fois que la position de la balle change	mais pas dans cette fonction
			this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.width);
		},

		update() {
			if (this.cpu.enable == 1 || this.player1.me == 1 || this.player2.me == 1)
			{
				this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
				this.updatecsore();
				if (this.player1.me == 1)
				{
					this.moveplayer(this.player1);
					if (this.cpu.enable == 0)
						this.updateplayertwo();
					this.updateball();
				}
				if (this.player2.me == 1)
				{
					this.moveplayer(this.player2);
					this.updateplayeroneandball();
				}
				if (this.cpu.enable == 1)
					this.movecpu(this.player2);
			}
			window.requestAnimationFrame(this.update);
		},
		createbackground() {
			// link the canvas to context
			this.context = <HTMLCanvasElement>this.$refs.Field.getContext("2d");
			this.context.canvas.width = window.innerWidth - 260;
			this.context.canvas.height = window.innerHeight - 145;
			// choose the color by the theme
			let body = document.getElementsByTagName('body')[0];
			if (body.classList.contains("dark"))
				this.context.fillStyle = 'white';
			else
				this.context.fillStyle = 'black';
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
			if (Math.floor(Math.random() * 2) == 1)
				this.ball.velocityx = -1;
			else
				this.ball.velocityx = 1;
			if (Math.floor(Math.random() * 2) == 1)
				this.ball.velocityy = -1;
			else
				this.ball.velocityy = 1;
			this.redrawPlayers();
		},
	},
});
</script>

<style scoped>
#Field {
	border: 3px solid;
}
</style>