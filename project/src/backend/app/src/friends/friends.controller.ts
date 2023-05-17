import { Body, Controller, Delete, Param, Post, Patch, Req, Res, Next, Get, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { AuthMiddleware } from '../users/users.middleware';
import { NextFunction, Response } from 'express';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { FriendRequestDto, FriendUpdateDto } from './dto/friendship.dto';
import { AuthGuard } from '../auth/auth.guard';
import {BlockUserService} from "../users/block-user.service";

@Controller('friends')
@ApiTags('Friendship')
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class FriendsController {
    constructor(
        private friendsService: FriendsService,
        private authMiddleware: AuthMiddleware,
        private blockUserService: BlockUserService,
    ) { }

    @Get()
    @UseGuards(AuthGuard)
    async getAllFriends(
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Next() next: NextFunction
    ) {
        if (!req.user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            const friends = await this.friendsService.getAllFriendships(req.user.id);
            res.send({ friends });
        }
    }


    @Get('requests')
    @UseGuards(AuthGuard)
    async getAllFriendRequests(
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Next() next: NextFunction
    ) {
        if (!req.user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            const friendRequests = await this.friendsService.getFriendRequests(req.user.id);
            res.send({ friendRequests });
        }
    }

    @Get('incoming')
    @UseGuards(AuthGuard)
    async getAllIncomingFriendRequests(
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Next() next: NextFunction
    ) {
        if (!req.user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            const friendRequests = await this.friendsService.getIncomingFriendRequests(req.user.id);
            res.send({ friendRequests });
        }
    }

    // Are we friends?
    @Get(':id')
    @UseGuards(AuthGuard)
    async getFriendship(
        @Param('id') userId: string,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Next() next: NextFunction
    ) {
        if (!req.user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            const friendship = await this.friendsService.getFriendship(req.user.id, userId);

            // is this user blocked?
            const isBlocked = await this.blockUserService.isBlocked(req.user.id, userId);

            res.send({ friendship, isBlocked });
        }
    }

    @Post('add')
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: FriendRequestDto })
    async sendFriendRequest(
        @Body() friendRequestDto: FriendRequestDto,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Next() next: NextFunction
    ) {
        if (!req.user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            if (friendRequestDto.friendId !== req.user.id) {
                const friendship = await this.friendsService.sendFriendRequest(friendRequestDto.userId, friendRequestDto.friendId);
                res.send({ friendship, message: 'Sent friend request successfully' });
            } else {
                res.status(401).send({ message: 'Unauthorize to send friend request to yourself' });
            }
        }
    }

    @Patch('accept')
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: FriendUpdateDto })
    async acceptFriendRequest(
        @Body() friendUpdateDto: FriendUpdateDto,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Next() next: NextFunction
    ) {
        if (!req.user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            if (friendUpdateDto.friendId !== req.user.id) {
                const friendship = await this.friendsService.acceptFriendRequest(friendUpdateDto.userId, friendUpdateDto.friendId);
                res.send({ friendship, message: 'Accepted friend request successfully' });
            } else {
                res.status(401).send({ message: 'Unauthorize to accept friend request from yourself' });
            }
        }
    }

    @Delete(':id/cancel')
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: FriendRequestDto })
    async cancelFriendRequestUser(
        @Param('id') userId: string,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Next() next: NextFunction
    ) {
        if (!req.user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            if (userId !== req.user.id) {
                await this.friendsService.cancelFriendRequest(req.user.id, userId);
                res.send({ message: 'Cancel friend request successfully' });
            } else {
                res.status(401).send({ message: 'Unauthorize to unfriend yourself' });
            }
        }
    }

    @Delete(':id/unfriend')
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: FriendRequestDto })
    async unfriendUser(
        @Param('id') userId: string,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Next() next: NextFunction
    ) {
        if (!req.user) {
            res.status(401).send({ message: 'Unauthorized' });
        } else {
            if (userId !== req.user.id) {
                await this.friendsService.unfriendUser(req.user.id, userId);
                res.send({ message: 'Unfriended successfully' });
            } else {
                res.status(401).send({ message: 'Unauthorize to unfriend yourself' });
            }
        }
    }
}