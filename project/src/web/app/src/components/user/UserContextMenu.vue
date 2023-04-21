<template>
    <div :class="['user-context-menu hidden', { 'user-context-menu--current-user': isCurrentUser }]">
        <ul>
            <li>
                <RunConversationButton :user="user?.id">
                    Envoyer un message
                </RunConversationButton>
            </li>
            <li>
                <GameProposalButton>
                    Lancer une partie
                </GameProposalButton>
            </li>
        </ul>
    </div>
</template>
  
<script lang="ts">
import type { UserInterface } from "@/interfaces/user.interface";
import { useUserStore } from "@/stores/user";
import { defineComponent } from "vue";
import RunConversationButton from "@/components/ui/button/RunConversationButton.vue";
import GameProposalButton from "@/components/ui/button/GameProposalButton.vue";

export default defineComponent({
    name: "UserContextMenu",
    components: {
        RunConversationButton,
        GameProposalButton,
    },
    props: {
        user: {
            type: Object as () => UserInterface,
            default: undefined,
        },
    },
    setup(props) {
    // check if current user is the same as the user in the card
    const userStore = useUserStore();
    const isCurrentUser = () => {
      return props.user?.pseudo === userStore.user?.pseudo ? true : false;
    };
    return {
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
    z-index: -1;
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
  