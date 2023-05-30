import { UserStatus, type UserInterface } from "@/interfaces/user.interface";
import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: localStorage.getItem("localUser")
      ? JSON.parse(localStorage.getItem("localUser") as string)
      : undefined,
  }),
  actions: {
    updateUser(user: UserInterface ) {
      this.user = user;
      localStorage.setItem("localUser", JSON.stringify(user));
    },
    setUser(user: UserInterface | undefined) {
      this.user = user;
      this.user.status = UserStatus.ONLINE;
      localStorage.setItem("localUser", JSON.stringify(user));
    },
    setUserStatus(status: UserStatus) {
      this.user.status = status;
      localStorage.setItem("localUser", JSON.stringify(this.user));
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
