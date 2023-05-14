import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Chat, ChatType, User, UserChat, UserChatPermission, UserChatStatus } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { CreateChannelDto, JoinChannelDto, memberStatusDto } from './dto/channels.dto';

@Injectable()
export class ChannelsService {
    remove: any;
    constructor(
        private prisma: PrismaService, 
        private usersService: UsersService
    ) {}

    async getAllChannels(): Promise<Chat[] | null> {
        const chat = await this.prisma.chat.findMany({
            where: {
                type: { not: ChatType.DIRECT }
            },
        }).catch((err) => {
            console.log(err);
            return null;
        });
        return chat;       
    }

    async getChannelById(chatId: string): Promise<User[] | null> {
        let chatUser = await this.prisma.userChat.findMany({
            where: {
                chatId: chatId
            }
        })
        const users = await this.prisma.user.findMany({
            where: {
                id: { in: chatUser.map((userChat) => userChat.userId)}
            },
        })

        return users;
    }

    async getChannelsByUser(userTofindId: string): Promise<Chat[] | null> {
        let chatUser = await this.prisma.userChat.findMany({
            where: {
                userId: userTofindId
            }
        })
        const chats = await this.prisma.chat.findMany({
            where: {
                id: { in: chatUser.map((userChat) => userChat.chatId)}, 
                type: { not: ChatType.DIRECT},
            },
            include: {
              users: true
            }
        })

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

    async createChannel(userId: string, settings: CreateChannelDto): Promise<Chat | null> {
        if (!userId) {
            console.log("error: userIds incorect");
            return null;
        }
        let channel = await this.prisma.chat.create({
                data: {
                    name: settings.name,
                    type: settings.type,
                    passwd: settings.password,
                },
            }).catch((err) => {
                console.log(err);
                return null;
            });
            await this.prisma.userChat.create({ 
                data: {
                    userId: userId,
                    chatId: channel.id,
                    status: UserChatStatus.OWNER,
                }
            }).catch((err) => {
                console.log(err);
                return null;
            });
        return channel;      
    }

    async joinChannel(data: JoinChannelDto, userId: string): Promise<Chat | void> {
        const channel = await this.prisma.chat.findUnique({ where: { id: data.chatId } });
        const userChannel = await this.prisma.userChat.findMany({ where: { chatId: data.chatId, userId: userId } });
        console.log('ici');
        if (userChannel.length > 0)
            return channel;
            console.log('ici');

        if (channel.type == ChatType.RESTRICTED) {
            if (channel.passwd != data.passwd)
                throw new BadRequestException("Wrong password");
        }
        console.log('ici');

        if (channel.type == ChatType.PRIVATE)
            throw new BadRequestException("Private channel can't be joined");
            console.log(channel.type);

        const log = await this.prisma.userChat.create({
            data: {
                userId: userId,
                chatId: data.chatId,
                status: UserChatStatus.MEMBER,
            }
        })
        console.log(log);
        return channel;
    }

    async isPermission(permission: string): Promise <boolean> {
        if (permission == UserChatPermission.MUTED || permission == UserChatPermission.BANNED || permission == UserChatPermission.COMPLIANT || permission == UserChatPermission.KICKED)
            return true;
        return false;
    }

    async memberStatus(userId: string, data: memberStatusDto): Promise <UserChat | null> {
        const channel = await this.prisma.chat.findUnique({ where: { id: data.chatId } });
        const userChannel = await this.prisma.userChat.findFirst({ where: { chatId: data.chatId, userId: userId } });
        console.log(userChannel);
        if (userChannel.status != UserChatStatus.OWNER && userChannel.status != UserChatStatus.ADMIN)
            throw new BadRequestException("Not allowed to perform this action");
        const memberChannel = await this.prisma.userChat.findFirst({ where: { chatId: data.chatId, userId: data.userId } });
        if (userChannel.status == UserChatStatus.OWNER) {           
            if (data.status == UserChatStatus.ADMIN || data.status == UserChatStatus.MEMBER || !data.status) {    
                if (data.permission == UserChatPermission.KICKED)
                    return (await this.prisma.userChat.delete({ where: { id: memberChannel.id } }));        
                return (await this.prisma.userChat.update({ where: { id: memberChannel.id }, data: { status: data.status, permission: data.permission } }));
            }
        }
        console.log("ICI");
        if (userChannel.status == UserChatStatus.ADMIN && memberChannel.status == UserChatStatus.MEMBER) {
            return (await this.prisma.userChat.update({ where: { id: memberChannel.id }, data: { permission: data.permission } }));
        }
    }

    async updateChannel(chatId: string, data: Chat): Promise<Chat> {
        return await this.prisma.chat.update({ where: { id: chatId }, data });
    }

    
    async deletechanel(chatId: string, userId: string): Promise<Chat | null> {
        // Check if channel exist
        const channel = await this.prisma.chat.findUnique({ where: { id: chatId } });
        if (!channel) {
            throw new BadRequestException("Channel not found");
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        }).catch((err) => {
            throw new BadRequestException(err);
        });

        if (user.role != "ADMIN") {
            const userChat = await this.prisma.userChat.findMany({
                where: {
                    chatId: chatId,
                    userId: userId,
                    status: UserChatStatus.OWNER
                }
            });
            if (userChat.length == 0) {
                throw new BadRequestException("User is not the owner of the channel");
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
            return deleted;
        }
    }
}
