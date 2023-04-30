<template>
    <button @click="permissionMember(user, channel, permission, status)" :class="class">
      <slot></slot>
    </button>
  </template>
  
  <script lang="ts">
  import { defineComponent } from "vue";
  import { useUserStore } from "@/stores/user";
  import axios from "axios";
  import router from "@/router";
  import { UserChatPermission } from "@/interfaces/user.interface"
  
  export default defineComponent({
    name: "permissionMemberButton",
    props: {
      class: {
        type: String,
        default: "",
      },
      user: {
        type: String,
        default: "",
        required: true,
      },
      channel: {
        type: String,
        default: "",
        required: true,
      },
      permission: {
        type: String,
        default: "COMPLIANT",
      },
      status: {
        type: String,
        default: "MEMBER",
      },

    },
    setup(props) {
      const userStore = useUserStore();
  
      return {
        userStore,
        user: props.user,
        channel: props.channel,
        permission: props.permission,
        status: props.status,
      };
    },
    methods: {
      async permissionMember(user: string, channel: string, permission: string, status: string) {
        try {
          const response = await axios
            .patch(
              `${import.meta.env.VITE_APP_API_URL}/channels/memberStatus`,
              {
                chatId: channel,
                userId: user,
                permission: permission,
                status: status,
              },
              {
                withCredentials: true,
                headers: {"Content-Type": "application/json",
                },
              }
            )
            .then((res) => {
              this.$router.push({
                name: "channel",
                params: {
                    id: channel,
                },
              });
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (error: any) {
          console.log(error);
        }
      },
    },
  });
  </script>
  