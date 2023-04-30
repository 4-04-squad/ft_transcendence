import type { IGameSettings } from "@/interfaces/game.interface";
import { defineStore } from "pinia";

export const useGamesSettingsStore = defineStore("gamesSettings",{
	state: () => ({
		gameSettings: [] as IGameSettings[],
	}),

	getters: {
		getGamesSettings(state): IGameSettings[] {
			return state.gameSettings;
		},

		getGameSettings(state) {
			return (gameId: string): IGameSettings | undefined => state.gameSettings.find((gameSettings) => gameSettings.gameId === gameId);
		}
	},

	actions: {
		addGameSettings(gameSettings: IGameSettings) {
			this.gameSettings.push(gameSettings);
		},

		updateGameSettings(gameSettings: IGameSettings) {
			const index = this.gameSettings.findIndex((gameSettings) => gameSettings.gameId === gameSettings.gameId);
			if (index !== -1) {
				this.gameSettings[index] = gameSettings;
			}
		},

		removeGameSettings(gameId: string) {
			const index = this.gameSettings.findIndex((gameSettings) => gameSettings.gameId === gameId);
			if (index !== -1) {
				this.gameSettings.splice(index, 1);
			}
		},
	},
	persist: {
		enabled: true,
	},
});

