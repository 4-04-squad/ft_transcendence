<template>
	<div class="field-view-container">
		<div style = "position:relative; left:60px; top:20px">
			<canvas id="Field" ref="Field" style="border: 3px solid;">
			</canvas>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
//import { oneKeyStroke } from "@vueuse/core";

export default defineComponent({
	name: "FieldView",
	components: {
	},
	setup() {
		let context = {}
		let ball = {
				xb: (window.innerWidth - 260) / 2 - 10,
				yb: (window.innerHeight - 145) / 2,
				x: 0,
				y: 0,
				velocity: 3,
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
				x: 0,
				y: 0,
				ply: 1
		}
		let player2 = {
				me: 0,
				speed: 10,
				tile: 75,
				x: 0,
				y: 0,
				ply: 2
		}
		return {
			player1,
			player2,
			ball,
			score,
			context
		}
	},
	methods: {
		moveplayer(player: Object) {
			this.context.fillRect(player.x, player.y, 10, 75);
			let up = "w";
			let down = "s";
			if (player.ply == 2)
			{
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
		);
		},

		createbackground()
		{
			// link the canvas to context
			this.context = <HTMLCanvasElement> this.$refs.Field.getContext("2d");
			this.context.canvas.width = window.innerWidth - 260;
			this.context.canvas.height = window.innerHeight - 145;
			
			// choose the color by the theme
			let body = document.getElementsByTagName('body')[0];
			if (body.classList.contains("dark"))
				this.context.fillStyle = 'white';
			else
				this.context.fillStyle = 'black';
		},

		updatecsore()
		{
			// Putting the middle line
			this.context.fillRect(this.context.canvas.width / 2, 0, 1, this.context.canvas.height);

			// Draw score & update
			this.context.font = '48px arial';
			this.context.fillText(this.score.p1, this.context.canvas.width / 2 - 41 - 10, 50);
			this.context.fillText(this.score.p2, this.context.canvas.width / 2 + 25, 50);
		},

		updateball()
		{
			// do the calcul for the ball nad the upadate of score
				//
			// Draw the Ball
			if (this.ball.rol == 1 && this.ball.x + this.ball.velocity >= this.context.canvas.width)
			{
				this.ball.rol = 0;
				this.ball.x = this.ball.xb;
				this.ball.y = this.ball.yb;
				this.score.p1++;
			}
			else if (this.ball.rol == 0 && this.ball.x - this.ball.velocity <= 0)
			{
				this.ball.rol = 1;
				this.ball.x = this.ball.xb;
				this.ball.y = this.ball.yb;
				this.score.p2++;
			}
			if (this.ball.rol == 0)
				this.ball.x -= this.ball.velocity;
			else
				this.ball.x += this.ball.velocity;
			this.context.fillRect(this.ball.x, this.ball.y, 20, 20)
		},

		update()
		{
			this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
			this.updatecsore();
			this.updateball();
			this.moveplayer(this.player2);
			this.moveplayer(this.player1);
			window.requestAnimationFrame(this.update);
		}
	},
	mounted() {
		this.createbackground();
		//set spawn point for player1
		this.player1.x = 10;
		this.player1.y = this.context.canvas.height / 2 - 25;

		//set spawn point for player2
		this.player2.x = this.context.canvas.width - 20;
		this.player2.y = this.context.canvas.height / 2 - 25;

		//set spawn point for ball
		this.ball.x = this.ball.xb;
		this.ball.y = this.ball.yb;

		window.requestAnimationFrame(this.update);
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