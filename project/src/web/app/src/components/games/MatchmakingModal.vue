<template>
	<div class="modal-container">
	  <div class="modal-backdrop" @click="closeModal"></div>
	  <form class="modal">
			<h1 class="modal-title">Looking for an opponent</h1>
            <div class="btns modal-action">
                <button class="btn btn--delete" @click="closeModal">Cancel</button>
            </div>
        </form>
	</div>
</template>
  
<script lang="ts">
import { useUserStore } from "@/stores/user";
import { defineComponent, inject } from "vue";
import type { Socket } from "socket.io-client";
import { deleteGame } from "@/services/gameServices";

  export default defineComponent({
	name: "MatchmakingModal",
	props: {
		gameId: {
			type: String,
			default: "",
		},
	},
	setup(props, { emit }) {
		const userStore = useUserStore();
		const socket = inject('socket') as Socket;

		const closeModal = () => {
			socket.emit("leaveWaiting", {
					userId: userStore.user.id,
			})
			emit("onClose", false);
			if (props.gameId)
				deleteGame(props.gameId);
		};

		return {
			closeModal,
            userStore
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