import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, UseGuards, Req, Res} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Chat, User } from '@prisma/client';
import { AuthMiddleware } from 'src/users/users.middleware';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { resolve } from 'path';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { CreateChannelDto, EditChannelDto, JoinChannelDto, memberStatusDto } from './dto/channels.dto';
import { AuthGuard } from '../auth/auth.guard';
import { get } from 'http';

@Controller('channels')
@ApiTags('Channels')
export class ChannelsController {
    constructor(
        private channelsService: ChannelsService,
        private authMiddleware: AuthMiddleware,
        ) {}

    @Get()
    @UseGuards(AuthGuard)
    async getAllChannels(@Req() req: RequestWithUser, @Res() res: Response) {
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channels = await this.channelsService.getAllChannels();
            res.send({ channels });
        }
    }

    @Get('@me')
    @UseGuards(AuthGuard)
    async getMyAllChannels(@Req() req: RequestWithUser, @Res() res: Response) {
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channels = await this.channelsService.getChannelsByUser(user.id);
            res.send({ channels });
        }
    }

    @Get('me/:id')
    @UseGuards(AuthGuard)
    async getMyChannelsById(
        @Param('id', ParseUUIDPipe) channelId: string,
        @Req() req: RequestWithUser, @Res() res: Response
        ) {
        const user = req.user;
        if (!user)
            res.status(401).send({ message: 'unauthorized' });
        else {
            const chat = await this.channelsService.getChannelme(channelId, user.id);
            res.send({ chat });
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getChannelsById(
        @Param('id', ParseUUIDPipe) channelId: string,
        @Req() req: RequestWithUser, @Res() res: Response
        ) {
        const user = req.user;
        if (!user)
            res.status(401).send({ message: 'unauthorized' });
        else {
            const chat = await this.channelsService.getChannelById(channelId);
            res.send({ chat });
        }
    }

    @Get(':id/members')
    @UseGuards(AuthGuard)
    async getChannelsMembers(
        @Param('id', ParseUUIDPipe) channelId: string,
        @Req() req: RequestWithUser, @Res() res: Response
        ) {
        const user = req.user;
        if (!user)
            res.status(401).send({ message: 'unauthorized' });
        else {
            const users = await this.channelsService.getChannelMembers(channelId, user.id);
            res.send({ users });
        }
    }

    @Post('create')
    @UseGuards(AuthGuard)
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
    @UseGuards(AuthGuard)
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

    @Get(':id/leave')
    @UseGuards(AuthGuard)
    async leave(
        @Param('id', ParseUUIDPipe) channelId: string, 
        @Req() req: RequestWithUser, 
        @Res() res: Response
    ) {
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channel = await this.channelsService.leaveChannel(channelId, user.id);
            res.send({ channel });
        }
    }

    @Patch('memberStatus')
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: memberStatusDto })
    async memberStatus(
        @Body() data: memberStatusDto, 
        @Req() req: RequestWithUser, 
        @Res() res: Response
    ) {
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channel = await this.channelsService.memberStatus(user.id, data);
            res.send({ channel });
        }
    }


    @Patch(':id')
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: EditChannelDto })
    async update(
        @Param('id', ParseUUIDPipe) channelId: string,
        @Body() data: EditChannelDto, 
        @Req() req: RequestWithUser, 
        @Res() res: Response
    ) {
        const user = req.user;
        if (!user) {
            res.status(401).send({ message: 'unauthorized' });
        } else {
            const channel = await this.channelsService.editChannel(user.id, channelId, data);
            res.send({ channel });
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async delete(
        @Param('id', ParseUUIDPipe) chatId: string, 
        @Req() req: RequestWithUser, 
        @Res() res: Response) {
        const user = req.user;
        if (!user) {
          res.status(401).send({ message: 'Unauthorized' });
        } else {
          const chats =  await this.channelsService.deletechannel(chatId, user.id);
          res.send({ chats });
        }
    }
}
