import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { PrismaService } from '../prisma.service';
import { UsersModule } from 'src/users/users.module';
import { AuthMiddleware } from 'src/users/users.middleware';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [UsersModule],
    controllers: [ChannelsController],
    providers: [ChannelsService, PrismaService, AuthMiddleware, AuthService, UsersService, JwtService]
})
export class ChannelsModule {}