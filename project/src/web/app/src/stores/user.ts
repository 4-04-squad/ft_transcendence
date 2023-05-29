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
    setUser(user: UserInterface | undefined) {
      const alertStore = useAlertStore();
      this.user = user;
      this.user.status = UserStatus.ONLINE;
      localStorage.setItem("localUser", JSON.stringify(user));
    },
    setUserStatus(status: UserStatus) {
      this.user.status = status;
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
