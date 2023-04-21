import type { ChatInterface } from "./chat.interface";
import type { UserInterface } from "./user.interface";

export interface MessageInterface {
  id: string;
  body: string;
  status?: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  chat: ChatInterface;
  chatId: string;
  user: UserInterface;
}

export const enum MessageStatus {
  RECEIVED = "RECEIVED",
  SENT = "SENT",
}
