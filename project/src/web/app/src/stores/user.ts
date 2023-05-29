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
    },
    setUser(user: UserInterface | undefined) {
      this.user = user;
      axios.patch(
        `${import.meta.env.VITE_APP_API_URL}/users/${this.user.id}/edit`,
        {
          status: UserStatus.ONLINE
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      this.user.status = UserStatus.ONLINE;
      localStorage.setItem("localUser", JSON.stringify(user));
    },
    setUserStatus(status: UserStatus) {
      axios.patch(
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
      );
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
function inject(arg0: string): Socket {
  throw new Error("Function not implemented.");
}

