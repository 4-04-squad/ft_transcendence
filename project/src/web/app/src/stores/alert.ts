import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";
import type { AlertInterface } from "@/interfaces/alert.interface";

export const useAlertStore = defineStore("alert", {
    state: () => ({
        alert: {} as AlertInterface | undefined,
    }),
    actions: {
        setAlert(alert: AlertInterface | undefined) {
            const banner = document.getElementById("alert-banner");
            this.alert = alert as AlertInterface | undefined;
            
            // set type
            if (this.alert && this.alert.status) {
                if (this.alert.status >= 200 && this.alert.status < 300) {
                    this.alert.type = "success";
                } else if (this.alert.status >= 300 && this.alert.status < 400) {
                    this.alert.type = "warning";
                } else if (this.alert.status >= 400 && this.alert.status < 500) {
                    this.alert.type = "error";
                } else {
                    this.alert.type = "info";
                }
            }

            banner && banner.classList.add("active");
            alert && setTimeout(() => this.clearAlert(), 4000);
        },
        clearAlert() {
            const banner = document.getElementById("alert-banner");
            banner && banner.classList.remove("active");
            this.alert = undefined;
        },
    },
    getters: {
        isAlert(): boolean {
            return !!this.alert && !!this.alert.status;
        },
    },
    persist: {
        enabled: true,
    },
});