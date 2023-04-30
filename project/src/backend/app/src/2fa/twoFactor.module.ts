import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma.service";
import { AuthMiddleware } from "src/users/users.middleware";
import { UsersModule } from "src/users/users.module";
import { UsersService } from "src/users/users.service";
import { TwoFactorAuthenticationController } from "./twoFactor.controller";
import { TwoFactorAuthenticationService } from "./twoFactor.service";

@Module({
    imports: [
        UsersModule,
        AuthModule,
        JwtModule.register({
          secret: process.env.JWT_TMP_SECRET,
          signOptions: { expiresIn: '10m' },
        }),
      ],
    controllers: [TwoFactorAuthenticationController],
    providers: [TwoFactorAuthenticationService, PrismaService, AuthMiddleware, AuthService, UsersService, JwtService]
})
export class TwoFactorAuthenticationModule {}