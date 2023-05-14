<template>
    <Modal :onCreate="createButtonHandler" :title="'Mot de passe'">
        <label for="password">Mot de passe :</label>
        <input type="password" id="password" v-model="password">
    </Modal>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Modal from "@/components/ui/form/Modal.vue";


export default defineComponent({
    name: "ChannelPasswdModal",
    components: {
        Modal,
    },
    setup(props, { emit }) {
        const password = ref("");
        const createButtonHandler = () => {
            emit("onCreate", password.value);
        };
        
        const closeModal = () => {
            emit("onClose", false);
        };

        return {
            password,
            closeModal,
            createButtonHandler,
        };
    },
});

</script>

<style lang="scss">
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
		width: 2rem;
		height: 1.8rem;
		border-radius: 0.3rem;
		padding: 0;
	}

    .wrapper{
        display: inline-flex;
        align-items: center;
        justify-content: space-evenly;
        
        button {
            color: lightgray;
        }
    }
}
	  
.form-group.color {
	flex-direction: row;
	align-items: center;
	align-content: center;
	justify-content: space-between;
}
  

.chat-type input[type="radio"] {
    display: none;
}

.chat-type {
    margin-bottom: 10px;
  }
  
  .chat-type label {
    display: block;
  }
  
  .chat-type-btn {
    display: inline-block;
    padding: 10px 20px;
    border: 2px solid #ccc;
    border-radius: 10px;
    cursor: pointer;  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease;

    font-size: 16px;
    font-weight: bold;
  }
  
  .chat-type-btn:hover {
    background-color: #f5f5f5;
    color: #2196f3;
  }
  
  .chat-type-btn:focus {
    outline: none;
  }

  
.chat-type-btn {
    background-color: #2196f3;
    color: #fff;
  }
.chat-type input[type="radio"]:checked + .chat-type-btn {
    background-color: #9b59b6;
    color: #fff;
  }
  
</style>
