<template>
	<div class="field-view-container">
		<div class="field-view-container__game-zone">
			<canvas id="Field" ref="Field" ></canvas>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
//import { oneKeyStroke } from "@vueuse/core";

export default defineComponent({
	name: "FieldView",
	props: {
		gameData: {
			type: Object,
			required: true,
		},
	},
	setup(props) {
		let context = {}
		let ball = {
			xb: (window.innerWidth - 260) / 2 - 10,
			yb: (window.innerHeight - 145) / 2,
			x: 0,
			y: 0,
			width: 20,
			velocity: 3,
			rebound: 0,
			rol: 1
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
		return {
			player1,
			player2,
			ball,
			score,
			context,
			gameData: props.gameData,
		}
	},
	methods: {
		moveplayer(player: Object) {
			this.context.fillRect(player.x, player.y, player.tilewidth, player.tile);
			let up = "w";
			let down = "s";
			if (player.ply == 2) {
				up = "ArrowUp";
				down = "ArrowDown";
			}
			/*onKeyStroke([up, down], (e) => {
				if (event.defaultPrevented) {
					return;
				}
				switch (event.key) {
					case down:
						this.context.clearRect(player.x, 0, 10, this.context.canvas.height);
						if ((player.y - player.speed) >= (this.context.canvas.height - (player.tile + 25)))
							player.y = this.context.canvas.height - player.tile;
						else
							player.y += player.speed;
						break;
					case up:
						this.context.clearRect(player.x, 0, 10, this.context.canvas.height);
						if ((player.y - player.speed) <= 0)
							player.y = 0;
						else
							player.y -= player.speed;
						break;
					default:
						return;
				}
				event.preventDefault();
				this.context.fillRect(player.x, player.y, 10, player.tile);
			},
			})*/
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
				this.context.fillRect(player.x, player.y, player.tilewidth, player.tile);
			},
			);
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
			if (this.ball.rol == 1 && this.ball.x + this.ball.velocity + this.ball.width >= this.context.canvas.width) {
				this.ball.rol = 0;
				this.ball.x = this.ball.xb;
				this.ball.y = this.ball.yb;
				this.ball.velocity = 3;
				this.score.p1++;
			}
			else if (this.ball.rol == 0 && this.ball.x - this.ball.velocity <= 0) {
				this.ball.rol = 1;
				this.ball.x = this.ball.xb;
				this.ball.y = this.ball.yb;
				this.ball.velocity = 3;
				this.score.p2++;
			}
			else if (this.ball.rol == 1 && this.ball.x + this.ball.velocity + this.ball.width >= this.player2.x) {
				if ((this.ball.y >= this.player2.y && this.ball.y <= this.player2.paddley)
					|| (this.ball.y + this.ball.width >= this.player2.y && this.ball.y + this.ball.width <= this.player2.paddley)) {
					if (++this.ball.rebound % 5 == 0)
						this.ball.velocity++;
					this.ball.rol = 0;
				}
			}
			else if (this.ball.rol == 0 && (this.ball.x - this.player1.tilewidth) - this.ball.velocity <= this.player1.x) {
				if ((this.ball.y >= this.player1.y && this.ball.y <= this.player1.paddley)
					|| (this.ball.y + this.ball.width >= this.player1.y && this.ball.y + this.ball.width <= this.player1.paddley)) {
					if (++this.ball.rebound % 5 == 0)
						this.ball.velocity++;
					this.ball.rol = 1;
				}
			}
			else
				;
			// draw the ball
			if (this.ball.rol == 0)
				this.ball.x -= this.ball.velocity;
			else
				this.ball.x += this.ball.velocity;
			this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.width);
		},

		update() {
			this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
			this.updatecsore();
			this.updateball();
			this.moveplayer(this.player2);
			this.moveplayer(this.player1);
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
		this.redrawPlayers();
		},
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
		this.ball.rol = Math.floor(Math.random() * 2);

		// Initialize player movement
		this.moveplayer(this.player1);
		this.moveplayer(this.player2);

		window.requestAnimationFrame(this.update);
		window.addEventListener("resize", this.handleWindowResize);
	},
});
		/*
*   TODO:
*   Use the canvas as Ref
*   Draw the canvas regarding window size
*   Draw players on each side
*   Draw the ball
*   Draw point counter for each players
*   
*   BONUS: Add full screen button
* 
*   Catch keyboard event (up, down)
*   Make player moving regarding keyboard and side (p1, p2) mappe different key for each players
*   Make the ball moving side by side, (velocity etc...)
*   connect socket
* 
*   Add game mode (velocity up, size bar change ... etc)
*/
</script>

<style scoped>
	#Field {
		border: 3px solid;
	}
</style>