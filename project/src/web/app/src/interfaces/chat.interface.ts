import type { MessageInterface } from "./message.interface";
import type { UserChat } from "./user.interface";

export interface ChatInterface {
  id: string;
  name?: string;
  type: ChatType;
  createdAt: Date;
  updatedAt: Date;
  users: UserChat[];
  messages: MessageInterface[];
}

export const enum ChatType {
  DIRECT = "DIRECT",
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
  RESTRICTED = "RESTRICTED",
}
