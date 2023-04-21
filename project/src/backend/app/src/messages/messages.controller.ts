import { Controller, Get, Post, Delete, Body, Param, Res, Req, Next, ParseUUIDPipe  } from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessagesService } from './messages.service';
import { ApiTags, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { AuthMiddleware } from 'src/users/users.middleware';
import { CreateMessageDto } from './dto/messages.dto';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';


@Controller('messages')
@ApiTags('Messages')
export class MessagesController {
  constructor(
    public messagesService: MessagesService,
    private authMiddleware: AuthMiddleware,
    ) {}

    @Get()
    async findAll(
      @Req() req: RequestWithUser,
      @Res({ passthrough: true }) res: Response,
      @Next() next: NextFunction
    ): Promise<Message[]> {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        if (req.user) {
          return this.messagesService.findAll();
        }
    }
  
    @Get(':id')
    async findOne(
      @Param('id', ParseUUIDPipe) id: string,
      @Req() req: RequestWithUser,
      @Res({ passthrough: true }) res: Response, 
      @Next() next: NextFunction
      ): Promise<Message> {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        if (req.user) {
          return this.messagesService.findOne(id);
        }
    }

    @Get('chat/:id')
    async findByChatId(
      @Param('id') id: string,
      @Req() req: RequestWithUser,
      @Res({ passthrough: true }) res: Response,
      @Next() next: NextFunction
    ): Promise<Message[]> {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        if (req.user) {
          return this.messagesService.findByChatId(id);
        }
    }

    @Get('channel/:id')
    async findByChannelId(
      @Param('id', ParseUUIDPipe) id: string,
      @Req() req: RequestWithUser,
      @Res({ passthrough: true }) res: Response,
      @Next() next: NextFunction
      ): Promise<Message[]> {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        if (req.user) {
          return this.messagesService.findByChannelId(id);
        }
    }

    @Get('user/:id')
    async findByUserId(
      @Param('id', ParseUUIDPipe) id: string,
      @Req() req: RequestWithUser,
      @Res({ passthrough: true }) res: Response,
      @Next() next: NextFunction
      ): Promise<Message[]> {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        if (req.user) {
          return this.messagesService.findByUserId(id);
        }
    }
  
    @Post()
    @ApiOkResponse({ type: CreateMessageDto })
    async create(
      @Body() createMessageDto: CreateMessageDto,
      @Req() req: RequestWithUser,
      @Res({ passthrough: true }) res: Response, 
      @Next() next: NextFunction
      ): Promise<Message> {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        if (req.user) {
          return this.messagesService.create(createMessageDto);
        }
    }
  
    @Delete(':id')
    async delete(
      @Param('id', ParseUUIDPipe) id: string,
      @Req() req: RequestWithUser,
      @Res({ passthrough: true }) res: Response, 
      @Next() next: NextFunction
      ): Promise<void> {
        await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
        if (req.user) {
          return this.messagesService.delete(req.user.id, id);
        }
    }
}
