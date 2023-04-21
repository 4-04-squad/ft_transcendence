import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { PrismaService } from '../prisma.service';
import { AuthMiddleware } from 'src/users/users.middleware';
import { AuthService } from 'src/auth/auth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UsersModule],
  controllers: [GamesController],
  providers: [GamesService, PrismaService, AuthMiddleware, AuthService, UsersService, JwtService]
})
export class GamesModule {}