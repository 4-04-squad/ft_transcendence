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

.hidden {
    display: none;
}

.user-context-menu {
    position: absolute;
    bottom: -100%;
    background-color: var(--primary-color);
    width: 100%;
    z-index: 5;
    padding: 0.5rem;
    border-bottom-left-radius: var(--radius-sm);
    border-bottom-right-radius: var(--radius-sm);

    ul {
        list-style: none;
        padding: 0;
        margin: 1rem 0 0;
        display: flex;
        flex-direction: column;
        font-weight: 500;
    }
}

</style>
  