import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { ChannelsModule } from './channels/channels.module';
import { GamesModule } from './games/games.module';
import { FriendsModule } from './friends/friends.modules';
import { MessagesModule } from './messages/messages.module';
import { SocketsModule } from './socket/socket.module';
import { TwoFactorAuthenticationModule } from './2fa/twoFactor.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const staticOptions = {
  rootPath: join(process.cwd(), 'uploads', 'avatars'),
  serveRoot: '/api/uploads',
  serveStaticOptions: {
    index: false,
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
    maxAge: 60 * 60 * 24 * 365,
  },
};

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    AuthModule,
    UsersModule,
    ChatsModule,
    ChannelsModule,
    GamesModule,
    FriendsModule,
    SocketsModule,
    TwoFactorAuthenticationModule,
    ServeStaticModule.forRoot(staticOptions),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
