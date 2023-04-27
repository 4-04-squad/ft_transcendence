<template>
	<div id="alert-banner" v-if="alert">
		<div class="alert" :class="`alert--${alert.type}`">
			{{ alert.message }}
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useAlertStore } from "@/stores/alert";
import type { AlertInterface } from "@/interfaces/alert.interface";

export default defineComponent({
	name: "AlertBanner",
	setup() {
		const alertStore = useAlertStore();
		let alert = alertStore.alert as AlertInterface | undefined;

		return {
			alert,
		};
	}
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

	&.active {
		opacity: 1;
		z-index: 1;
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