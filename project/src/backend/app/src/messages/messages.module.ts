import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { AuthMiddleware } from '../users/users.middleware';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { MessagesController } from './messages.controller';
import { ChatsModule } from 'src/chats/chats.module';
import { UsersModule } from 'src/users/users.module';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { ChatsService } from 'src/chats/chats.service';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ChatsModule,
  ],
  controllers: [MessagesController],
  providers: [
    UsersService, 
    PrismaService, 
    AuthMiddleware, 
    AuthService, 
    MessagesService, 
    ChatsService,
    JwtService],
})
export class MessagesModule {}