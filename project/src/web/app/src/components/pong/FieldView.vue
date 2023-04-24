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
	setup() {
		return {
			context: {},
			ball: {
				x: (window.innerWidth - 260) / 2 - 5,
				y: (window.innerHeight - 145) / 2
			},
			score: {
				p1: 0,
				p2: 0
			},
			positionp1: {
				x: 0,
				y: 0
			},
			positionp2: {
				x: 0,
				y: 0
			}
		}
	},
	methods: {
	},
	mounted() {
		this.context = <HTMLCanvasElement> this.$refs.Field.getContext("2d");
		this.context.canvas.width = window.innerWidth - 260;
		this.context.canvas.height = window.innerHeight - 145;

		// choose color
		let body = document.getElementsByTagName('body')[0];
		if (body.classList.contains(".dark"))
			this.context.fillStyle = "white";
		else
			this.context.fillStyle = "black";

		// Background
		//this.context.fillStyle = "white";
		//this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

		// Set line in background
		this.context.fillRect(this.context.canvas.width / 2, 0, 1, this.context.canvas.height);

		//set spawn point for each player
		this.positionp1.x = 10;
		this.positionp1.y = this.context.canvas.height / 2 - 25;
		
		this.positionp2.x = this.context.canvas.width - 20;
		this.positionp2.y = this.context.canvas.height / 2 - 25;
		
		// Player 1
		this.context.fillRect(this.positionp1.x, this.positionp1.y, 10, 75);

		// Player 2
		this.context.fillRect(this.positionp2.x, this.positionp2.y, 10, 75);

		// Draw score
		this.context.font = '48px arial';
		this.context.fillText(this.score.p1, this.context.canvas.width / 2 - 10 - 50, 50);
		this.context.fillText(this.score.p2, this.context.canvas.width / 2 - 10 + 50, 50);

		// Draw Ball
		this.context.fillRect(this.ball.x, this.ball.y, 10, 10)
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