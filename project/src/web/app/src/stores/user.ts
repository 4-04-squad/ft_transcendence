import type { UserInterface } from "@/interfaces/user.interface";
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
    setUser(user: UserInterface | undefined) {
      this.user = user;
      localStorage.setItem("localUser", JSON.stringify(user));
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
  persist: {
    enabled: true,
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
