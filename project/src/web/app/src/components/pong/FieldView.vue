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

export default defineComponent({
	name: "FieldView",
	data() {
		return {
			context: {},
			ball: {
				x: (window.innerWidth - 260) / 2 - 10,
				y: (window.innerHeight - 145) / 2,
				velocity: 0
			},
			score: {
				p1: 0,
				p2: 0,
				max_score: 9
			},
			player1: {
				me: 0,
				speed: 10,
				tile: 75,
				x: 0,
				y: 0
			},
			player2: {
				me: 0,
				speed: 10,
				tile: 75,
				x: 0,
				y: 0
			}
		}
	},
	setup() {
	},
	methods: {
	},
	mounted() {
		this.context = <HTMLCanvasElement> this.$refs.Field.getContext("2d");
		this.context.canvas.width = window.innerWidth - 260;
		this.context.canvas.height = window.innerHeight - 145;

		// choose color
		let body = document.getElementsByTagName('body')[0];
		if (body.classList.contains("dark"))
			this.context.fillStyle = 'white';
		else
			this.context.fillStyle = 'black';

		// Set line in background
		this.context.fillRect(this.context.canvas.width / 2, 0, 1, this.context.canvas.height);

		//set spawn point for each player
		this.player1.x = 10;
		this.player1.y = this.context.canvas.height / 2 - 25;
		
		this.player2.x = this.context.canvas.width - 20;
		this.player2.y = this.context.canvas.height / 2 - 25;
		
		// Player 1
		this.context.fillRect(this.player1.x, this.player1.y, 10, 75);
		window.addEventListener("keydown", (event) => {
				if (event.defaultPrevented) {
				return;
    		}
			switch (event.key) {
				case "s":
					this.context.clearRect(this.player1.x, 0, 10, this.context.canvas.height);
					if ((this.player1.y - this.player1.speed) >= (this.context.canvas.height - (this.player1.tile + 25)))
						this.player1.y = this.context.canvas.height - this.player1.tile;
					else
						this.player1.y += this.player1.speed;
					break;
				case "w":
					this.context.clearRect(this.player1.x, 0, 10, this.context.canvas.height);
					if ((this.player1.y - this.player1.speed) <= 0)
						this.player1.y = 0;
					else
						this.player1.y -= this.player1.speed;
					break;
				default:
					return;
			}
			event.preventDefault();
			this.context.fillRect(this.player1.x, this.player1.y, 10, this.player1.tile);	
		},
		);

		// Player 2
		this.context.clearRect(this.player2.x, 0, 10, this.context.canvas.height);
		this.context.fillRect(this.player2.x, this.player2.y, 10, 75);
		window.addEventListener("keydown", (event) => {
				if (event.defaultPrevented) {
				return;
    		}
			switch (event.key) {
				case "l":
					this.context.clearRect(this.player2.x, 0, 10, this.context.canvas.height);
					if ((this.player2.y - this.player2.speed) >= (this.context.canvas.height - (this.player2.tile + 25)))
						this.player2.y = this.context.canvas.height - this.player2.tile;
					else
						this.player2.y += this.player2.speed;
					break;
				case "o":
					this.context.clearRect(this.player2.x, 0, 10, this.context.canvas.height);
					if ((this.player2.y - this.player2.speed) <= 0)
						this.player2.y = 0;
					else
						this.player2.y -= this.player2.speed;
					break;
				default:
					return;
			}
			event.preventDefault();
			this.context.fillRect(this.player2.x, this.player2.y, 10, this.player2.tile);	
		},
		);

		// Draw score
		this.context.font = '48px rog fonts';
		this.context.fillText(this.score.p1, this.context.canvas.width / 2 - 41 - 10, 50);
		this.context.fillText(this.score.p2, this.context.canvas.width / 2 + 10, 50);

		// Ball
		this.context.fillRect(this.ball.x, this.ball.y, 20, 20)
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