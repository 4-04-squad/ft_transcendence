<template>
    <div :class="['user-context-menu hidden', { 'user-context-menu--current-user': isCurrentUser }]">
        <ul>
            <li>
                <RunConversationButton :user="user?.id">
                    Envoyer un message
                </RunConversationButton>
            </li>
            <li>
                <GameProposalButton :user="user?.id">
                    Lancer une partie
                </GameProposalButton>
            </li>
            <li v-if="type === 'member' && (myUserChatStatus == 'ADMIN' || myUserChatStatus == 'OWNER')">
                <permissionMemberButton :user="user?.id" :channel="object" :permission="'KICKED'">
                    Kick
                </permissionMemberButton>
            </li>
            <li v-if="type === 'member' && (myUserChatStatus == 'ADMIN' || myUserChatStatus == 'OWNER')">
                <permissionMemberButton :user="user?.id" :channel="object" :permission="'BANNED'">
                    Ban
                </permissionMemberButton>
            </li>
            <li v-if="type === 'member' && (myUserChatStatus == 'ADMIN' || myUserChatStatus == 'OWNER')">
                <permissionMemberButton :user="user?.id" :channel="object" :permission="'MUTED'">
                    Mute
                </permissionMemberButton>
            </li>
            <li v-if="type === 'member' && myUserChatStatus == 'OWNER'">
                <permissionMemberButton :user="user?.id" :channel="object" :status="'ADMIN'">
                    Promote
                </permissionMemberButton>
            </li>
        </ul>
    </div>
</template>
  
<script lang="ts">
import type { UserInterface } from "@/interfaces/user.interface";
import { useUserStore } from "@/stores/user";
import { defineComponent, ref } from "vue";
import { UserChatPermission } from "@/interfaces/user.interface"
import RunConversationButton from "@/components/ui/button/RunConversationButton.vue";
import GameProposalButton from "@/components/ui/button/GameProposalButton.vue";
import permissionMemberButton from "@/components/ui/button/permissionMemberButton.vue";
import axios from "axios";
import { objectExpression } from "@babel/types";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "@/stores/alert";

export default defineComponent({
    name: "UserContextMenu",
    components: {
        RunConversationButton,
        GameProposalButton,
        permissionMemberButton,
    },
    props: {
        user: {
            type: Object as () => UserInterface,
            default: undefined,
        },
        type: {
            type: String,
            default: "",
        },
        object: {
            type: String,
            default: "",
        },
    },
    setup(props) {
        const alertStore = useAlertStore();
        const myUserChatStatus = ref("");

        if(props.type === "member") {
            axios.get(
                `${import.meta.env.VITE_APP_API_URL}/channels/me/${props.object}`,
                {
                    withCredentials: true,
                }
            ).then((response) => {
                myUserChatStatus.value = response.data.chat.status;
            }).catch((error) => {
                const alert = {
                    status: error.response.data.statusCode,
                    message: error.response.data.message,
                } as AlertInterface;

                alertStore.setAlert(alert);
            });
        }
        // check if current user is the same as the user in the card
    const userStore = useUserStore();
    const isCurrentUser = () => {
      return props.user?.pseudo === userStore.user?.pseudo ? true : false;
    };
    return {
        myUserChatStatus,
        isCurrentUser,
    };
  },
})
</script>
  
<style lang="scss">

.user-context-menu {
    background-color: var(--primary-color);
    width: 100%;
    padding: 0.5rem;
    border-radius: var(--radius-sm);
    margin-top: 0.5rem;

    &.hidden {
        display: none;
    }

    ul {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        font-weight: 500;
        width: 100%;
        
        li {
            padding: 0.2rem 0;
            border-bottom: 1px solid var(--primary-color-light);
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            font-weight: bold;

            &:hover {
                background-color: var(--primary-color-light);
            }
        }
    }
}

</style>
  