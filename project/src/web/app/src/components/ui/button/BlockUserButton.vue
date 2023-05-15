<template>
  <div class="btns" v-if="userStore.user?.id !== friendId">
    <button @click="blockUnblock" :class="class">
      <span class="btn--friend btn--friend--block" v-if="isBlocked">
        <UnlockIcon />
        <span class="status" v-if="isBlocked">
          Unblock
        </span>
      </span>
      <span class="btn--friend btn--friend--block" v-else>
        <LockIcon />
        <span class="status">
            Block
        </span>
      </span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import {
LockIcon,
UnlockIcon,
} from "@/components/icons";

export default defineComponent({
  name: "BlockUserButton",
  components: {
    LockIcon,
    UnlockIcon,
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
    const isBlocked = ref(false);

    const fetchBlockedStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/users/@me/${props.friendId}/blocked`,
          {
            withCredentials: true,
          }
        );
        isBlocked.value = response.data.isBlocked;
      } catch (error) {
        console.log(error);
      }
    };

    onMounted(() => {
      fetchBlockedStatus();
    });

    watch(
      () => props.friendId,
      () => {
        fetchBlockedStatus();
      },
      { immediate: true }
    );

    const blockUnblock = async () => {
      const endpoint = isBlocked.value ? `/users/${props.friendId}/unblock` : `/users/${props.friendId}/block`;

      try {
        await axios.post(`${import.meta.env.VITE_APP_API_URL}${endpoint}`, null, {
          withCredentials: true,
        });
        // Refresh block status after blocking/unblocking
        fetchBlockedStatus();
      } catch (error) {
        console.log(error);
      }
    };

    return {
      userStore,
      isBlocked,
      friendId: props.friendId,
      blockUnblock,
    };
  },
});
</script>
