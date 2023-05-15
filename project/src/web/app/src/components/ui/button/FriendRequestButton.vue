<template>
  <div class="btns" v-if="userStore.user?.id !== friendId">
    <button
    @click="accept"
    :class="class"
    v-if="isFriend === 'pending' && requester === friendId"
  >
    <span class="btn--friend btn--friend--accept mr-4">
      <FriendIcon /><span class="status">Accepter</span>
    </span>
  </button>
  <button
    @click="remove"
    :class="class"
    class="can-remove-friend"
    v-if="isFriend === 'true'"
  >
    <span class="btn--friend btn--friend--accept">
      <FriendIcon /><span class="status">Ami</span>
    </span>
    <span class="btn--friend btn--friend--decline remove-friend">
      <RemoveFriendIcon /><span class="status">Supprimer</span>
    </span>
  </button>
  <button
  @click="cancel"
  :class="class"
  v-else-if="isFriend === 'pending' && requester === friendId"
  >
    <span class="btn--friend btn--friend--pending">
      <RemoveFriendIcon /><span class="status">Refuser</span>
    </span>
  </button>
  <button
    @click="cancel"
    :class="class"
    v-else-if="isFriend === 'pending' && requester !== friendId"
  >
    <span class="btn--friend btn--friend--pending">
      <PendingFriendIcon /><span class="status">Annuler</span>
    </span>
  </button>
  <button 
    @click="add"
    :class="class"
    v-else-if="isFriend === 'false'"
  >
    <span class="btn--friend btn--friend--add">
      <AddFriendIcon /><span class="status">Ajouter</span>
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
import { FriendsRequestStatus } from "@/interfaces/friend.interface";

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
    let isFriend = ref(FriendsRequestStatus.FALSE as FriendsRequestStatus);
    let requester = ref("" as string);
    let receiver = ref("" as string);
    let friendshipId = ref("" as string);

    watch(
      () => isFriend.value,
      async () => {
        const response = await axios
          .get(`${import.meta.env.VITE_APP_API_URL}/friends/${props.friendId}`, {
            withCredentials: true,
          })
          .then((response) => {
            requester.value = response.data.friendship.userId;
            receiver.value = response.data.friendship.friendId;
            friendshipId.value = response.data.friendship.id;

            if (response.data.friendship.accepted == true)
              isFriend.value = FriendsRequestStatus.TRUE;
            else if (response.data.friendship.accepted == false)
              isFriend.value = FriendsRequestStatus.PENDING;
            else 
              isFriend.value = FriendsRequestStatus.FALSE;
          })
          .catch((error) => {
            if (error.response?.status == 400) {
              isFriend.value = FriendsRequestStatus.PENDING;
            }
          });
      },
      { immediate: true } // Call the function immediately when the component is created
    );


    return {
      userStore,
      isFriend,
      requester,
      receiver,
      friendshipId,
      friendId: props.friendId,
    };
  },
  methods: {
    async add() {
      const response = await axios
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
          this.isFriend = FriendsRequestStatus.PENDING;
        })
        .catch((error) => {
          if (error.response?.status == 400) {
            console.log(error.response?.data);
            this.isFriend = FriendsRequestStatus.TRUE;
          }
        });
    },
    async remove() {
      // Remove the current user as friend of the user we are on if friend
      const response = await axios
        .delete(
          `${import.meta.env.VITE_APP_API_URL}/friends/${
            this.friendId
          }/unfriend`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          // update the `isFriend` ref variable
          this.isFriend = FriendsRequestStatus.FALSE;
        })
        .catch((error) => {
          if (error.response?.status == 400) {
            console.log(error.response?.data);
            this.isFriend = FriendsRequestStatus.FALSE;
          }
        });
    },
    async cancel() {
      // Remove the current user as friend of the user we are on if friend
      const response = await axios
        .delete(`${import.meta.env.VITE_APP_API_URL}/friends/${
            this.friendId
          }/cancel`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          this.isFriend = FriendsRequestStatus.FALSE;
        })
        .catch((error) => {
          if (error.response?.status == 400) {
            console.log(error.response?.data);
            this.isFriend = FriendsRequestStatus.FALSE;
          }
        });
    },
    async accept() {
      // Approve the current user as friend of the user we are on if friend
      const response = await axios
        .patch(
          `${import.meta.env.VITE_APP_API_URL}/friends/accept`,
          {
            userId: this.receiver,
            friendId: this.requester,
            accepted: true,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          this.isFriend = FriendsRequestStatus.TRUE;
        })
        .catch((error) => {
          if (error.response?.status == 400) {
            console.log(error.response?.data);
            this.isFriend = FriendsRequestStatus.TRUE;
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

  .status {
    margin-left: 0.5rem;
  }
}

.can-remove-friend {

  .remove-friend {
    display: none;
  }

  &:hover {
    .btn--friend--accept {
      display: none;
    }

    .remove-friend {
      display: flex;
    }
  }
}
</style>
