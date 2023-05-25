<template>
	<div class="modal-container">
	  <div class="modal-backdrop" @click="closeModal"></div>
	  <form class="modal">
			<h1 class="modal-title">{{ title() }}</h1>
		<slot></slot>
		<div class="btns modal-action">
			<button class="btn btn--delete" @click="closeModal">Annuler</button>
			<button class="btn btn--success" @click="createButtonHandler">{{ buttonText() }}</button>
		</div>
	</form>
	</div>
  </template>
  
<script lang="ts">
  import { defineComponent, ref, watch } from "vue";

  export default defineComponent({
	name: "Modal",
	props: {
		title: String,
		buttonText: {
			type: String,
			default: "Créer",
		},
		onCreate: {
			type: Function,
			required: true,
		}
	},
	setup(props, { emit }) {
		const closeModal = () => {
			console.log('closeModal here');
			emit("onClose", false);
		};

		const createButtonHandler = () => {
			props.onCreate(); 
		};

		return {
			closeModal,
			createButtonHandler,
			title: () => props.title,
			buttonText: () => props.buttonText,
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