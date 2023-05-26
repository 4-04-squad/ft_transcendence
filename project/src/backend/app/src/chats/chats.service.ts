import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Chat, ChatType, User } from '@prisma/client';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatsService {
  remove: any;
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) { }

  async chatExists(user1Id: string, user2Id: string): Promise<Chat | null> {
    const user1 = await this.usersService.getUserById(user1Id);
    const user2 = await this.usersService.getUserById(user2Id);
    if (!user1 || !user2) {
      throw new BadRequestException('Invalid user ID(s)');
    }
    const chat = await this.prisma.chat.findFirst({
      where: {
        type: ChatType.DIRECT,
        users: {
          every: {
            OR: [
              { userId: user1Id },
              { userId: user2Id },
            ]
          },
        },
      },
    });
    return chat;
  }

  async getAllChats(): Promise<Chat[] | null> {
    const chat = await this.prisma.chat.findMany({
      where: {
        type: ChatType.DIRECT
      },
    }).catch((err) => {
      return null;
    });

    return chat;
  }

  async getChatById(chatId: string): Promise<Chat> {
    const chat = this.prisma.chat.findUnique({
      where: {
        id: chatId
      },
      include: {
        users: true
      }
    });
    return chat;
  }

  async getChatByUser(userTofindId: string): Promise<Chat[] | null> {
    let chatUser = await this.prisma.userChat.findMany({
      where: {
        userId: userTofindId
      }
    })
    const chats = await this.prisma.chat.findMany({
      where: {
        type: ChatType.DIRECT,
        id: {
          in: chatUser.map((userChat) => userChat.chatId)
        }
      },
      include: {
        users: true
      }
    });

    // Get all user ids from the chats
    const userIds = chats.reduce((acc, chat) => {
      chat.users.forEach(user => {
        if (!acc.includes(user.userId)) {
          acc.push(user.userId)
        }
      })
      return acc
    }, [])

    // Query users by their ids
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      }
    })

    // Map user details to each chat object
    const result = chats.map(chat => {
      const chatUsers = chat.users.map(chatUser => {
        const user = users.find(u => u.id === chatUser.userId)
        return {
          ...chatUser,
          user
        }
      })
      return {
        ...chat,
        users: chatUsers
      }
    })

    return result
  }

  async createChat({ user1Id, user2Id }: { user1Id: string, user2Id: string }): Promise<Chat | void> {
    
    if (!user1Id || !user2Id || (user1Id == user2Id)) {
      throw new BadRequestException('Invalid user ID(s)');
      return null;
    }

    // check if chat already exists between users
    const chatExists = await this.chatExists(user1Id, user2Id);
    if (chatExists) {
      return chatExists;
    }

    let chat = await this.prisma.chat.create({
      data: {

      },
    }).catch((err) => {
      return null;
    });

    await this.prisma.userChat.create({
      data: {
        userId: user1Id,
        chatId: chat.id,
      }
    }).catch((err) => {
      return null;
    });

    await this.prisma.userChat.create({
      data: {
        userId: user2Id,
        chatId: chat.id,
      }
    }).catch((err) => {
      return null;
    });

    return chat;
  }

  async updateChat(chatId: string, data: Chat): Promise<Chat> {
    // Check if chat exists
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId
      }
    }).catch((err) => {
      throw new BadRequestException(err);
    });

    if (!chat) {
      throw new BadRequestException("Chat does not exist");
    }

    return await this.prisma.chat.update({ where: { id: chatId }, data });
  }

  async deleteChat(chatId: string, userId: string): Promise<Chat | null> {
    // check if chat exists
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId
      }
    }).catch((err) => {
      throw new BadRequestException(err);
    });

    if (!chat) {
      throw new BadRequestException("Chat does not exist");
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    }).catch((err) => {
      throw new BadRequestException(err);
    });

    if (user.role != "ADMIN") {
      throw new BadRequestException("User is not an admin");
    }

    await this.prisma.userChat.deleteMany({
      where: {
        chatId: chatId
      }
    }).catch((err) => {
      throw new BadRequestException(err);
    });
    const deleted = this.prisma.chat.delete({
      where: {
        id: chatId
      }
    }).catch((err) => {
      throw new BadRequestException(err);
    });

    // TODO: Remove user from socket room

    return deleted;
  }
}
