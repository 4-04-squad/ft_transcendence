import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Patch, Req, Res, Next, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserStatus } from '@prisma/client';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { AuthMiddleware } from './users.middleware';
import { NextFunction, Response } from 'express';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('users')
@ApiTags('Users')
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authMiddleware: AuthMiddleware,
  ) { }

  @Get()
  async getAllUsers(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      let users = await this.usersService.getAllUsers();
      res.send({ users });
    }
  }

  @Get('@me')
  @ApiOkResponse({ type: UserDto })
  async loginUser(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized.' });
    } else {
      this.usersService.updateUserStatus(user.id, UserStatus.ONLINE);
      res.send({ user });
    }
  }

  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  async getUserById(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      let user = await this.usersService.getUserById(userId);
      res.send({ user });
    }
  }

  @Get(':status/:limit')
  @ApiOkResponse({ type: UserDto })
  async getUserByStatus(
    @Param('status') status: string,
    @Param('limit') limit: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
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
  @ApiOkResponse({ type: UserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() data: UserDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id === userId || req.user.role === 'ADMIN') {
        let user = await this.usersService.updateUser(userId, data);
        res.send({ user, message: 'User updated' });
      } else {
        res.status(401).send({ message: 'Unauthorized' });
      }
    }
  }

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
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
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    if (!req.user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      if (req.user.id === userId || req.user.role === 'ADMIN') {
        let user = await this.usersService.updateUserAvatar(userId, file);
        res.send({ user, message: 'Avatar updated' });
      } else {
        res.status(401).send({ message: 'Unauthorized' });
      }
    }
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserDto })
  async remove(
    @Param('id', ParseUUIDPipe) userId: string,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Next() next: NextFunction
  ) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
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
}