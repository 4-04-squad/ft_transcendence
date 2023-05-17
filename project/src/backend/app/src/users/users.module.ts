import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from "../auth/jwt.strategy";
import { AuthMiddleware } from './users.middleware';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { BlockUserService } from './block-user.service';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtStrategy, AuthMiddleware, AuthService, BlockUserService],
})
export class UsersModule {}