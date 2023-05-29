import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { SocketsGateway } from './socket.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketsGateway, UsersService, PrismaService],
  exports: [SocketsGateway],
})
export class SocketsModule {}
