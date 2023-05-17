import type { MessageInterface } from '@/interfaces/message.interface'
import { defineStore } from 'pinia'

export const useMessageStore = defineStore('messages', {
	state: () => ({
		message: [] as MessageInterface[],
	}),

	getters: {
		getMessages: (state) => {
			return (chatId: string) => state.message.filter((msg) => msg.chatId === chatId);
		},
	},

	actions: {
		addMessage(message: MessageInterface) {
			const index = this.message.find((msg) => msg.id === message.id);
			if (index === undefined) {
				this.message.push(message);
			}
		},
	},
	persist: {
		enabled: true,
	},
});