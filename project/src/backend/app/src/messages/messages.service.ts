import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Message } from '@prisma/client';
import { CreateMessageDto } from './dto/messages.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async isOwner(userId: string, messageId: string): Promise<boolean> {
    const message = await this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new BadRequestException('Message does not exist');
    }

    return message.userId === userId;
  }

  async userExists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return Boolean(user);
  }  

  async chatExists(id: string): Promise<boolean> {
    const chat = await this.prisma.chat.findUnique({ where: { id } });
    return Boolean(chat);
  }

  async findAll(): Promise<Message[]> {
    return this.prisma.message.findMany();
  }

  async findOne(id: string): Promise<Message> {
    return this.prisma.message.findUnique({
      where: {
        id,
      },
    });
  }

  async findByChatId(chatId: string): Promise<Message[]> {

    if (!(await this.chatExists(chatId))) {
      throw new BadRequestException('Chat does not exist');
    }

    return this.prisma.message.findMany({
      where: {
        chatId,
      },
    });
  }

  async findByChannelId(channelId: string): Promise<Message[]> {
    if (!(await this.chatExists(channelId))) {
      throw new BadRequestException('Channel does not exist');
    }

    const chat = await this.prisma.chat.findUnique({
      where: {
        id: channelId,
      },
      include: {
        messages: true,
      },
    });

    return chat?.messages || [];
  }

  async findByUserId(userId: string): Promise<Message[]> {
    if (!(await this.userExists(userId))) {
      throw new BadRequestException('User does not exist');
    }

    return this.prisma.message.findMany({
      where: {
        userId,
      },
    });
  }
  
  

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const { chatId, userId, body } = createMessageDto;

    if (!(await this.userExists(userId))) {
      throw new BadRequestException('User does not exist');
    }

    if (!(await this.chatExists(chatId))) {
      throw new BadRequestException('Chat does not exist');
    }

    return this.prisma.message.create({
      data: {
        body,
        chat: {
          connect: { id: chatId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async delete(userId: string, messageId): Promise<void> {

    if (!(await this.isOwner(userId, messageId))) {
      throw new BadRequestException('You are not the owner of this message');
    }

    await this.prisma.message.delete({
      where: {
        id: messageId,
      },
    });
  }
}
