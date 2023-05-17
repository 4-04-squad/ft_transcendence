<template>
    <Modal :onCreate="createButtonHandler" :title="'Cree un channel'">
        <div class="form-group">
            <label for="channel-name">Nom du channel</label>
            <input type="text" id="channel-name" v-model="channelName"/>
        </div>

        <div class="form-group">
            <label>Type de channel</label>
            <div class="wrapper">
                <div class="chat-type">
                    <label>
                    <input type="radio" v-model="channelType" value="PUBLIC" name="chat-type" checked>
                    <div class="chat-type-btn public">
                        Public
                    </div>
                    </label>
                </div>
                <div class="chat-type">
                    <label>
                    <input type="radio" v-model="channelType" value="RESTRICTED" name="chat-type">
                    <div class="chat-type-btn restricted">
                        RESTRICTED
                    </div>
                    </label>
                </div>
                <div class="chat-type">
                    <label>
                    <input type="radio" v-model="channelType" value="PRIVATE" name="chat-type">
                    <div class="chat-type-btn private">
                        Private
                    </div>
                    </label>
                </div>
            </div>
        </div>
        <div class="form-group" v-if="channelType === 'RESTRICTED'">
            <label for="channel-password">Mot de passe</label>
            <input type="password" id="channel-password" v-model="channelPassword"/>
        </div>
    </Modal>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Modal from "@/components/ui/form/Modal.vue";


export default defineComponent({
    name: "ChannelSettingsModal",
    components: {
        Modal,
    },
    setup(props, { emit }) {
        const channelName = ref("");
        const channelType = ref("PUBLIC");
        const channelPassword = ref("");
        const createButtonHandler = () => {
            emit("onCreate", {
                name: channelName.value,
                type: channelType.value,
                password: channelPassword.value,
            });
        };
        
        const closeModal = () => {
            emit("onClose", false);
        };

        return {
            channelName,
            channelPassword,
            channelType,
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

    input[type="text"] {
        color: black;
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
