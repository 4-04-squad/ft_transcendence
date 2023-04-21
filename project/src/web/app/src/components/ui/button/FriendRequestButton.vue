<template>
 <div v-if="userStore.user?.id !== friendId">
  <button @click="add" :class="class" v-if="isFriend === 'false'">
    <span class="btn--friend btn--friend--add">
      <AddFriendIcon /><span class="status">Ajouter</span>
    </span>
  </button>
  <button
    @click="cancel"
    :class="class"
    class="can-remove-friend"
    v-else-if="isFriend === 'pending'"
  >
    <span class="btn--friend btn--friend--pending">
      <PendingFriendIcon /><span class="status">En attente</span>
    </span>
    <span class="btn--friend btn--friend--remove remove-friend">
      <RemoveFriendIcon /><span class="status">Annuler</span>
    </span>
  </button>
  <button
    @click="remove"
    :class="class"
    class="can-remove-friend"
    v-else-if="isFriend === 'true'"
  >
    <span class="btn--friend btn--friend--accepted">
      <FriendIcon /><span class="status">Amis</span>
    </span>
    <span class="btn--friend btn--friend--remove remove-friend">
      <RemoveFriendIcon /><span class="status">Supprimer</span>
    </span>
  </button>
 </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import {
  AddFriendIcon,
  RemoveFriendIcon,
  PendingFriendIcon,
  FriendIcon,
} from "@/components/icons";

enum Friends {
  FALSE = "false",
  TRUE = "true",
  PENDING = "pending",
  APPROVE = "approve",
}

export default defineComponent({
  name: "FriendRequestButton",
  components: {
    AddFriendIcon,
    RemoveFriendIcon,
    PendingFriendIcon,
    FriendIcon,
  },
  props: {
    friendId: {
      type: String,
      default: "",
    },
    class: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const userStore = useUserStore();
    let isFriend = ref(Friends.FALSE);

    watch(
      () => props.friendId,
      async () => {
        const response = axios
          .get(`${import.meta.env.VITE_APP_API_URL}/friends/${props.friendId}`, {
            withCredentials: true,
          })
          .then((response) => {
            console.log(props.friendId);
            if (response.data.friendship.accepted == true)
              isFriend.value = Friends.TRUE;
            else if (response.data.friendship.accepted == false)
              isFriend.value = Friends.PENDING;
            else isFriend.value = Friends.FALSE;
          })
          .catch((error) => {
            if (error.response?.status == 400) {
              isFriend.value = Friends.PENDING;
            }
          });
      },
      { immediate: true } // Call the function immediately when the component is created
    );

    return {
      userStore,
      isFriend,
    };
  },
  methods: {
    add() {
      // Add the current user as friend of the user we are on if not friend
      const response = axios
        .post(
          `${import.meta.env.VITE_APP_API_URL}/friends/add`,
          {
            userId: this.userStore.user?.id,
            friendId: this.friendId,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          if (response.data.friendship.accepted == true)
            this.isFriend = Friends.TRUE;
          else if (response.data.friendship.accepted == false)
            this.isFriend = Friends.PENDING;
          else this.isFriend = Friends.FALSE;
        })
        .catch((error) => {
          if (error.response?.status == 400) {
            console.log(error.response?.data);
            this.isFriend = Friends.TRUE;
          }
        });
    },
    remove() {
      // Remove the current user as friend of the user we are on if friend
      const response = axios
        .delete(
          `${import.meta.env.VITE_APP_API_URL}/friends/${
            this.friendId
          }/unfriend`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          this.isFriend = Friends.FALSE;
        })
        .catch((error) => {
          if (error.response?.status == 400) {
            console.log(error.response?.data);
            this.isFriend = Friends.FALSE;
          }
        });
    },
    cancel() {
      // Remove the current user as friend of the user we are on if friend
      const response = axios
        .delete(`${import.meta.env.VITE_APP_API_URL}/friends/${
            this.friendId
          }/cancel`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          this.isFriend = Friends.FALSE;
        })
        .catch((error) => {
          if (error.response?.status == 400) {
            console.log(error.response?.data);
            this.isFriend = Friends.FALSE;
          }
        });
    },
    accept() {
      // Approve the current user as friend of the user we are on if friend
      const response = axios
        .patch(
          `${import.meta.env.VITE_APP_API_URL}/friends/accept`,
          {
            userId: this.userStore.user?.id,
            friendId: this.friendId,
            accepted: true,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          this.isFriend = Friends.TRUE;
        })
        .catch((error) => {
          if (error.response?.status == 400) {
            console.log(error.response?.data);
            this.isFriend = Friends.TRUE;
          }
        });
    },
  },
});
</script>

<style lang="scss">
.btn--friend {
  display: flex;
  align-items: center;

  svg {
    margin-right: 1rem;
  }

  .status {
    display: none;
  }
}
.remove-friend {
  display: none;
}
.can-remove-friend {
  &:hover {
    .btn--friend--pending {
      display: none;
    }

    .btn--friend--accepted {
      display: none;
    }
    .remove-friend {
      display: flex;
    }
  }
}
</style>
