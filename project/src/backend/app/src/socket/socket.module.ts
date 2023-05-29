import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { SocketsGateway } from './socket.gateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketsGateway, UsersService, PrismaService, AuthService, JwtService],
  exports: [SocketsGateway],
})
export class SocketsModule {}
