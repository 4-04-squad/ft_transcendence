import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards, Req, Res} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Chat, User } from '@prisma/client';
import { AuthMiddleware } from 'src/users/users.middleware';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { resolve } from 'path';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { CreateChannelDto, JoinChannelDto, memberStatusDto } from './dto/channels.dto';

@Controller('channels')
@ApiTags('Channels')
export class ChannelsController {
    constructor(
        private channelsService: ChannelsService,
        private authMiddleware: AuthMiddleware,
        ) {}

    @Get()
    async getAllChannels(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channels = await this.channelsService.getAllChannels();
            res.send({ channels });
        }
    }

    @Get('@me')
    async getMyAllChannels(@Req() req: RequestWithUser, @Res() res: Response) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channels = await this.channelsService.getChannelsByUser(user.id);
            res.send({ channels });
        }
    }

    @Get(':id')
    async getChannelsById(
        @Param('id', ParseUUIDPipe) channelId: string,
        @Req() req: RequestWithUser, @Res() res: Response
        ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user)
            res.status(401).send({ message: 'unauthorized' });
        else {
            const users = await this.channelsService.getChannelById(channelId, user.id);
            res.send({ users });
        }
    }

    @Post('create')
    @ApiOkResponse({ type: CreateChannelDto })
    async create(
        @Body() data: CreateChannelDto, 
        @Req() req: RequestWithUser, 
        @Res() res: Response
        ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channel = await this.channelsService.createChannel(user.id, data);
            res.send({ channel });
        }
    }

    @Post('join')
    @ApiOkResponse({ type: JoinChannelDto })
    async join(
        @Body() data: JoinChannelDto, 
        @Req() req: RequestWithUser, 
        @Res() res: Response
    ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));

        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channel = await this.channelsService.joinChannel(data, user.id);
            res.send({ channel });
        }
    }

    @Patch('memberStatus')
    @ApiOkResponse({ type: memberStatusDto })
    async memberStatus(
        @Body() data: memberStatusDto, 
        @Req() req: RequestWithUser, 
        @Res() res: Response
    ) {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channel = await this.channelsService.memberStatus(user.id, data);
            res.send({ channel });
        }
    }


    @Patch(':id')
    @ApiOkResponse({ type: JoinChannelDto })
    async update(
        @Param('id', ParseUUIDPipe) channelId: string,
        @Body() data: Chat,
    ): Promise<Chat> {
        return await this.channelsService.updateChannel(channelId, data);
    }

    @Delete(':id')
    async delete(
        @Param('id', ParseUUIDPipe) chatId: string, 
        @Req() req: RequestWithUser, 
        @Res() res: Response) {      
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        const user = req.user;
        if (!user) {
          res.status(401).send({ message: 'Unauthorized' });
        } else {
          const chats =  await this.channelsService.deletechanel(chatId, user.id);
          res.send({ chats });
        }
    }
}
