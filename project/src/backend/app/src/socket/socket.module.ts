import { Module } from '@nestjs/common';
import { SocketsGateway } from './socket.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketsGateway],
  exports: [SocketsGateway],
})
export class SocketsModule {}
