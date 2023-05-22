import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";
import type { AlertInterface } from "@/interfaces/alert.interface";

export const useAlertStore = defineStore("alert", {
    state: () => ({
        alert: undefined as AlertInterface | undefined,
    }),
    actions: {
        setAlert(alert: AlertInterface | undefined) {
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
			if (this.alert && this.alert?.timeout === undefined)
				this.alert.timeout = 5000;
        },
        clearAlert() {
            // clear alert
            this.alert = undefined;
        },
    },
    getters: {
        isAlert(): boolean {
            return !!this.alert && !!this.alert.status;
        },
    },
});