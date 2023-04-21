<template>
    <div class="field-view-container">
        <canvas id="main-field"></canvas>
    </div>
</template>
  
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "FieldView",
    setup() {

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

        return {
        };
    },
    methods: {
    },
});
</script>
  