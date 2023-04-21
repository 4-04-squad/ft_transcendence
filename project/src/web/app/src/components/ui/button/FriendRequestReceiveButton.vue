<template>
  <div class="btns" v-if="userStore.user?.id !== friendId">
    <button
    @click="accept"
    :class="class"
    v-if="isFriend === 'pending'"
  >
    <span class="btn--friend btn--friend--accept">
      <FriendIcon />
    </span>
  </button>
  <button
    @click="remove"
    :class="class"
  >
    <span class="btn--friend btn--friend--decline">
      <RemoveFriendIcon />
    </span>
  </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import {
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
  name: "FriendRequestReceiveButton",
  components: {
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
