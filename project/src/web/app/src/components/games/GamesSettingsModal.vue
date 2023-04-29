<template>
	<div class="modal-container">
	  <div class="modal-backdrop" @click="closeModal"></div>
	  <form class="modal">
		<h1 class="modal-title">Créer une game</h1>
		<div class="form-group">
		  <label for="ball-speed">Vitesse de la balle</label>
		  <input type="range" id="ball-speed" v-model="ballSpeed" min="1" max="10" />
		</div>
		<div class="form-group">
		  <label for="paddle-speed">Vitesse de la raquette</label>
		  <input type="range" id="paddle-speed" v-model="paddleSpeed" min="1" max="10" />
		</div>
		<div class="form-group">
			<label for="ball-speed">Taille de la balle</label>
			<input type="range" id="ball-size" v-model="ballSize" min="1" max="10" />
		  </div>
		  <div class="form-group">
			<label for="paddle-speed">Taille de la raquette</label>
			<input type="range" id="paddle-size" v-model="paddleSize" min="1" max="10" />
		  </div>
		<div class="form-group color">
		  <label for="ball-color">Couleur de la balle</label>
		  <input type="color" id="ball-color" v-model="ballColor" />
		</div>
		<div class="form-group color">
			<label for="padd-color">Couleur des raquette</label>
			<input type="color" id="padd-color" v-model="paddleColor" />
		  </div>
		<div class="form-group color">
		  <label for="background-color">Couleur de fond</label>
		  <input type="color" id="background-color" v-model="backgroundColor" />
		</div>
		<div class="form-group color">
			<label for="background-color">Score maximum</label>
			<input type="number" id="background-color" v-model="scoreMax" />
		  </div>
		<div class="modal-action number">
			<button class="btn btn--cancel" @click="closeModal">Annuler</button>
			<button class="btn btn--submit" @click="createButtonHandler">Créer</button>
		</div>
	</form>
	</div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from "vue";

  export default defineComponent({
	name: "GameSettingsModal",
	props: {
	  isOpen: Boolean,
	},
	setup(props, { emit }) {
	  const ballSpeed = ref(5);
	  const ballSize = ref(5);
	  const paddleSpeed = ref(5);
	  const paddleSize = ref(5);
	  const ballColor = ref("#ffffff");
	  const paddleColor = ref("#ffffff");
	  const backgroundColor = ref("#000000");
	  const scoreMax = ref(5);
  
	  // check the changes of the settings
	  watch([ballSpeed, paddleSpeed, ballColor, backgroundColor], () => {
		console.log('settings changed', ballSpeed.value, paddleSpeed.value, ballColor.value, backgroundColor.value);
	  });

	  const createButtonHandler = () => {
		emit("onCreate", {
			gameId: 0,
			ballSpeed: ballSpeed.value,
			paddleSpeed: paddleSpeed.value,
			ballColor: ballColor.value,
			backgroundColor: backgroundColor.value,
			ballSize: ballSize.value,
			paddleSize: paddleSize.value,
			paddleColor: paddleColor.value,
			scoreLimit: scoreMax.value,
		});
	  };
  
	  const closeModal = () => {
		emit("onClose", false);
	  };
  
	  return {
		ballSpeed,
		paddleSpeed,
		ballColor,
		backgroundColor,
		ballSize,
		paddleSize,
		paddleColor,
		scoreMax,
		closeModal,
		createButtonHandler,
	  };
	},
  });
  </script>
  
  <style lang="scss">
  .modal-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
  }
  
  .modal-backdrop {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1001;
  }
  
  .modal {
	width: 30rem;
	background-color: var(--secondary-color);
	border-radius: 0.6rem;
	padding: 1rem;
	z-index: 1002;
	label{
		font-weight: bold;
	}

	.modal-action{
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}
  }
  
  .modal-title {
	margin-bottom: 1rem;
	text-align: center;
  }
  
  .form-group {
	margin-bottom: 1rem;
	display: flex;
	flex-direction: column;

	label {
	  display: block;
	  margin-bottom: 10px;
	}
  
	input {
	  width: 100%;
	  box-sizing: border-box;
	  padding: 5px 10px;
	}

	input[type="color"] {
		width: 1.5rem;
		height: 1.8rem;
		border-radius: 0.3rem;
		padding: 0;
	}

	input[type="number"]{
		width: 4rem;
		height: 1.8rem;
		border-radius: 0.3rem;
		padding: 0;
	}

	}
	  

  .form-group.color .form-group.number {
	flex-direction: row;
	align-items: center;
	align-content: center;
	justify-content: space-between;
  }
  
  .btn {
	&--submit {
	  background-color: var(--primary-color);
	  color: #fff;
	  border: none;
	  padding: 10px 20px;
	  cursor: pointer;
	  transition: background-color 0.3s ease;
  
	  &:hover {
		background-color: var(--primary-color);
	  }
	}
  
	&--cancel {
	  background-color: var(--danger-color);
	  color: #fff;
	  border: none;
	  padding: 10px 20px;
	  cursor: pointer;
	  transition: background-color 0.3s ease;
  
	  &:hover {
		background-color: var(--danger-color);
	  }
	}
  }

</style>