import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, Req, Res, Next, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserStatus } from '@prisma/client';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { NextFunction, Response } from 'express';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from '../auth/auth.guard';
import { BlockUserService } from './block-user.service';
import { PrismaService } from 'src/prisma.service';

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/gif': 'gif'
};

@Controller('users')
@ApiTags('Users')
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class UsersController {
  constructor(
    private usersService: UsersService,
    private blockUserService: BlockUserService,
    private prismaService: PrismaService
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getAllUsers(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction) {
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      let users = await this.usersService.getAllUsers();
      res.send({ users });
    }
  }

  @Get('@me')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserDto })
  async loginUser(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    let user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized.' });
    } else {
      if (user.twofaenabled) {
        res.status(206).send({ user });
        return;
      }
      this.usersService.updateUserStatus(user.id, UserStatus.ONLINE);
      user = this.prismaService.exclude(user, ['password', 'twofasecret']);
      
      res.send({ user });
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserDto })
  async getUserById(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      let user = await this.usersService.getUserById(userId);
      res.send({ user });
    }
  }

  @Get(':status/:limit')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserDto })
  async getUserByStatus(
    @Param('status') status: string,
    @Param('limit') limit: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      let users = await this.usersService.getUsersByStatus(status, limit, req.user.id);
      res.send({ users });
    }
  }

  @Post('/create')
  async createUser(@Body() data: UserDto): Promise<User> {
    return this.usersService.createUser(data);
  }

  @Patch(':id/edit')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UpdateUserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() data: UpdateUserDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id === userId || req.user.role === 'ADMIN') {
        let user = await this.usersService.updateUser(userId, data);
        delete user["password"];
        delete user["twofasecret"];
        res.send({ user, message: 'User updated' });
      } else {
        res.status(401).send({ message: 'Unauthorized' });
      }
    }
  }

  @Patch(':id/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', {
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      let error = isValid ? null : new Error('Invalid mime type!');
      cb(error, isValid);
    },
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const filename = file.originalname.split('.')[0];
        const extension = file.originalname.split('.')[1];
        cb(null, `${filename}-${Date.now()}.${extension}`);
      }
    })
  }))
  @ApiOkResponse({ type: UserDto })
  async updateUserAvatar(
    @Param('id', ParseUUIDPipe) userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id === userId || req.user.role === 'ADMIN') {
        let user = await this.usersService.updateUserAvatar(userId, file);
        delete user["password"];
        delete user["twofasecret"];
        res.send({ user, message: 'Avatar updated' });
      } else {
        res.status(401).send({ message: 'Unauthorized' });
      }
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserDto })
  async remove(
    @Param('id', ParseUUIDPipe) userId: string,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Next() next: NextFunction
  ) {
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id === userId || req.user.role === 'ADMIN') {
        await this.usersService.deleteUser(userId);
        res.clearCookie(process.env.JWT_NAME);
        res.send({ message: 'User deleted' });
      } else {
        res.status(401).send({ message: 'Unauthorized to delete the user.' });
      }
    }
  }

  @Get(':id/blocked')
  @UseGuards(AuthGuard)
  async isBlocked(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const isBlocked = await this.blockUserService.isBlocked(req.user.id, userId);
      res.send({ isBlocked });
    }
  }

  @Get('@me/:id/blocked')
  @UseGuards(AuthGuard)
  async hasBlocked(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const isBlocked = await this.blockUserService.isBlocked(userId, req.user.id);
      res.send({ isBlocked });
    }
  }


@Get('blocked')
@UseGuards(AuthGuard)
async getBlocked(
  @Req() req: RequestWithUser,
  @Res({ passthrough: true }) res: Response)
{
  if (!req.user) {
    res.status(401).send({ message: 'Unauthorized' });
  } else {
    const blockedUsers = await this.blockUserService.getBlockedUsers(req.user.id);
    res.send({ blockedUsers });
  }
}

@Post(':id/block')
@UseGuards(AuthGuard)
async blockUser(
  @Req() req: RequestWithUser,
  @Param('id') userId: string,
  @Res({ passthrough: true }) res: Response) {
  if (!req.user) {
    res.status(401).send({ message: 'Unauthorized' });
  } else {
    await this.blockUserService.blockUser(userId, req.user.id);
    res.send({ message: 'User blocked successfully' });
  }
}

@Post(':id/unblock')
@UseGuards(AuthGuard)
async unblockUser(
  @Req() req: RequestWithUser,
  @Param('id') userId: string,
  @Res({ passthrough: true }) res: Response) {
  if (!req.user) {
    res.status(401).send({ message: 'Unauthorized' });
  } else {
    await this.blockUserService.unblockUser(userId, req.user.id);
    res.send({ message: 'User unblocked successfully' });
  }
}

}