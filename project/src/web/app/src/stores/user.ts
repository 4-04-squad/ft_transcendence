import { UserStatus, type UserInterface } from "@/interfaces/user.interface";
import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";
import type { AlertInterface } from "@/interfaces/alert.interface";
import { useAlertStore } from "./alert";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: localStorage.getItem("localUser")
      ? JSON.parse(localStorage.getItem("localUser") as string)
      : undefined,
  }),
  actions: {
    updateUser(user: UserInterface ) {
      this.user = user;
    },
    async setUser(user: UserInterface | undefined) {
      const alertStore = useAlertStore();
      this.user = user;
      this.user.status = UserStatus.ONLINE;
      localStorage.setItem("localUser", JSON.stringify(user));
    },
    async setUserStatus(status: UserStatus) {
      const alertStore = useAlertStore();
     await axios.patch(
        `${import.meta.env.VITE_APP_API_URL}/users/${this.user.id}/edit`,
        {
          status: status
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          }, 
        }
      ).then((res) => {
        this.user.status = status;
      }).catch((err) => {
        const alert = {
          status: 400,
          message: "Cannot set user status",
        } as AlertInterface;
        alertStore.setAlert(alert);
      });
    },
    clearUser() {
      this.user = undefined;
      localStorage.removeItem("localUser");
    },
  },
  getters: {
    isAuthenticated(): boolean {
      return !!this.user && !!this.user.id;
    },
  },
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useUserStore().clearUser();
    }
    // redirect to login page
    router.push({ name: "login" });
    return Promise.reject(error);
  }
);
