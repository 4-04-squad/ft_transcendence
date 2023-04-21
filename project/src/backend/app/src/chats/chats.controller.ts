import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, Req, Res } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Chat } from '@prisma/client';
import { AuthMiddleware } from 'src/users/users.middleware';
import { Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { CreateChatDto } from './dto/chats.dto';
import { SocketsGateway } from 'src/socket/socket.gateway';

@Controller('chats')
@ApiTags('Chats')
export class ChatsController {
    constructor(
        private chatsService: ChatsService,
        private authMiddleware: AuthMiddleware,
        private readonly socketGateway: SocketsGateway,
    ) { }

    @Get()
    async getAllChats(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const chats = await this.chatsService.getAllChats();
            res.send({ chats });
        }
    }

    @Get('@me')
    async getMyAllChats(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const chats = await this.chatsService.getChatByUser(user.id);
            res.send({ chats });
        }
    }

    @Get(':id')
    async getChatsById(
        @Param('id', ParseUUIDPipe) chatId: string,
        @Req() req: RequestWithUser,
        @Res() res: Response,
    ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            let chat = await this.chatsService.getChatById(chatId);
            if (chat) {
                const room = await this.socketGateway.getSocketIdByChatId(chat.id);
                if (room) {
                    // join socket room
                    await this.socketGateway.joinSocketRoom(chat.id, user.id);
                    res.send({ data: { chat, room } });
                } else {
                    // create socket room
                    await this.socketGateway.createSocketRoom(chat.id);
                    const newRoom = await this.socketGateway.getSocketIdByChatId(chat.id);
                    await this.socketGateway.joinSocketRoom(chat.id, user.id);
                    res.send({ data: { chat, room: newRoom } });
                }
            } else {
                res.status(404).send({ message: 'Chat room not found' });
            }
        }
    }


    @Post('create')
    @ApiOkResponse({ type: CreateChatDto })
    async create(
        @Body() data: { userId: string },
        @Req() req: RequestWithUser,
        @Res() res: Response
    ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const chat = await this.chatsService.createChat({ user1Id: user.id, user2Id: data.userId });
            // create socket room
            if (chat) {
                await this.socketGateway.createSocketRoom(chat.id);
                res.send({ chat });
            } else {
                res.status(404).send({ message: 'Chat not created' });
            }            
        }
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) chatId: string,
        @Body() data: Chat,
    ): Promise<Chat> {
        return await this.chatsService.updateChat(chatId, data);
    }

    @Delete(':id')
    async delete(
        @Param('id', ParseUUIDPipe) chatId: string,
        @Req() req: RequestWithUser,
        @Res() res: Response
    ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            const chat = await this.chatsService.deleteChat(chatId, user.id);
            // delete socket room
            await this.socketGateway.deleteSocketRoom(chatId);
            res.send({ chat });
        }
    }
}
