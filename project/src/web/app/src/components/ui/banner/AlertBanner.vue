<template>
    <div id="alert-banner" v-if="alert">
        <div class="alert" :class="`alert--${alert.type}`" @click="handleBannerClick">
            {{ alert.message }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useAlertStore } from "@/stores/alert";
import type { AlertInterface } from "@/interfaces/alert.interface";
import router from "@/router";
import { joinGame } from "@/services/gameServices";
import type { TimerOptions } from "timers";

export default defineComponent({
    name: "AlertBanner",
    setup() {
        const alertStore = useAlertStore();
        const alert = ref<AlertInterface | undefined>(alertStore.alert);
        let timeoutId: any;

        alert.value = alertStore.alert;

        const toggleBanner = (isActive: boolean) => {
            const banner = document.getElementById("alert-banner");
            if (isActive) {
                banner && banner.classList.add("active");
            } else {
                banner && banner.classList.remove("active");
            }
        };

        // detect changes in alertStore.alert
        watch(
            () => alertStore.alert,
            async (newAlert) => {
                alert.value = newAlert;

                if (newAlert) {
                    await nextTick();
                    toggleBanner(true);
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        toggleBanner(false);
                        alertStore.clearAlert();
                    }, 5000);
                } else {
                    toggleBanner(false);
                }
            }
        );

        onMounted(() => {
            if (alert.value) {
                toggleBanner(true);
            }
        });

        onBeforeUnmount(() => {
            clearTimeout(timeoutId);
        });

        return {
            alert,
			alertStore
        };
    },
	methods: {
		handleBannerClick() {
			if (this.alert && this.alert.link) {
				if (this.alert.socketType == "game") {
					joinGame(this.alert.link)
					.then((res) => {
						if (this.alert?.link)
							router.push({ name: this.alert.socketType, params: { id: this.alert.link } });
					})
					.catch((err) => {
						const alert = {
							status: err.response.status,
							message: err.response.data.message,
						} as AlertInterface;

						this.alertStore.setAlert(alert);
					});
				} else {
					if (this.alert?.link) {
						router.push({ name: this.alert.socketType, params: { id: this.alert.link } });
					}
				}
			}
		}
	},
});
</script>


<style lang="scss">
#alert-banner {
	position: absolute;
	top: 0;
	right: 0;
	opacity: 0;
	z-index: -1;
	padding: 30px;
	cursor: pointer;

	&.active {
		opacity: 1;
		z-index: 102;
		transition: opacity 0.3s ease-in-out;
	}

	.alert {
		padding: var(--spacing-md);
		border-radius: var(--radius);
		font-size: 1.1rem;

		&--success {
			background-color: var(--success-color);
			color: var(--success-text);
		}

		&--error {
			background-color: var(--danger-color);
			color: var(--danger-text);
		}

		&--warning {
			background-color: var(--warning-color);
			color: var(--warning-text);
		}

		&--info {
			background-color: var(--info-color);
			color: var(--info-text);
		}
	}
}
</style>