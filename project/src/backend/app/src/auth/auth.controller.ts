import { Controller, Get, Req, Res, UseGuards, ForbiddenException, Param, Body, Post } from '@nestjs/common';
import { Response } from 'express';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import axios from 'axios';
import { UserStatus } from '@prisma/client';
import { ApiTags, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService, private usersService: UsersService) {}

  // @Post('signin')
  // async loginWithUsername(@Body() body: {pseudo: string, password: string}, @Req() req: RequestWithUser, @Res() res: Response) {
    
  //   const { pseudo, password } = body;
  //   const jwtName = process.env.JWT_NAME;
  //   const jwtTmpName = process.env.JWT_TMP_NAME;
  //   const user = await this.authService.findUserByName(pseudo, password);
  
  //   // Check if user has a JWT token
  //   if (!req.cookies[jwtName]) {
  //     const isTwoFactorEnabled = user.twofaenabled;
  
  //     // Create a token
  //     const token = isTwoFactorEnabled
  //       ? this.authService.createTempToken(user)
  //       : this.authService.createToken(user);
  
  //     // Check token
  //     if (!token) {
  //       throw new ForbiddenException('Forbidden, token is missing.');
  //     }
  
  //     // Set the JWT cookie

  //     const maxAge = isTwoFactorEnabled ? 600000 : 86400000;
  //     const cookieName = isTwoFactorEnabled ? jwtTmpName : jwtName;
  //     res.cookie(cookieName, token, {
  //       httpOnly: true,
  //       secure: false,
  //       sameSite: 'lax',
  //       maxAge 
  //     });
      
  //     if (isTwoFactorEnabled) {
  //       res.status(206).send({ user });
  //       return;
  //     }
  //   }
  
  //   // Set user as ONLINE
  //   if (user) {
  //     this.usersService.updateUserStatus(user.id, UserStatus.ONLINE);
  //   }
  
  //   // Send the response
  //   res.status(200).send({ user });
  
  // }

  @Get('login')
  @ApiResponse({ status: 302, description: 'Redirect to 42 API'})
  async loginWithFortyTwo(@Req() req: RequestWithUser, @Res() res: Response) {
  };

  @Post('login/callback')
  @ApiResponse({ status: 401, description: 'Error authenticating with 42 API'})
  async loginWithFortyTwoCallback(@Body() data: {code: string}, @Req() req: RequestWithUser, @Res() res: Response) {

    try {
      const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.FORTY_TWO_CLIENT_ID,
        client_secret: process.env.FORTY_TWO_CLIENT_SECRET,
        code: data.code,
        redirect_uri: `${process.env.WEB_URL}/login/callback`,
      });

      const userDataResponse = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      });

      const { id, email, first_name, last_name, login, image } = userDataResponse.data;

      // is user already in database ?
      const firstLogin = await this.authService.findUserByEmail(email);   
      const redirect = firstLogin ? `profile` : `user-edit`;

      const user = await this.authService.findOrCreate({
        id,
        email,
        firstName: first_name,
        lastName: last_name,
        fortyTwoId: id,
        pseudo: login,
        avatar: image.versions.medium || "/img/marvin.png"
      });
      
      if (!req.cookies[process.env.JWT_NAME]) {
        const isTwoFactorEnabled = user.twofaenabled;
  
        const jwtName = process.env.JWT_NAME;
        const jwtTmpName = process.env.JWT_TMP_NAME;
        
        // Create a token
        const token = isTwoFactorEnabled
          ? this.authService.createTempToken(user)
          : this.authService.createToken(user);
    
        // Check token
        if (!token) {
          throw new ForbiddenException('Forbidden, token is missing.');
        }
    
        // Set the JWT cookie
        const maxAge = isTwoFactorEnabled ? 600000 : 86400000;
        const cookieName = isTwoFactorEnabled ? jwtTmpName : jwtName;
        res.cookie(cookieName, token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge 
        });
    
        // Send the response
        const statusCode = isTwoFactorEnabled ? 206 : 302;
        if (isTwoFactorEnabled) {
          delete user["password"];
          delete user["twofasecret"];
          res.status(statusCode).send({ user });
          return;
        }  
      }

      // Set user as ONLINE
      if (user) {
        this.usersService.updateUserStatus(user.id, UserStatus.ONLINE);
      }

      delete user["password"];
      delete user["twofasecret"];
      res.status(200).send({user, redirect });
    } catch (error) {
      res.status(401).send('Error authenticating with 42 API');
    }
  }

  @UseGuards(AuthGuard)
  @Post('signout')
  async logout(@Req() req: RequestWithUser, @Res() res: Response) {
    const user = req.user;

    // Set user as OFFLINE
    if (user) {
      this.usersService.updateUserStatus(user.id, UserStatus.OFFLINE);
      res.clearCookie(process.env.JWT_NAME);
      return this.authService.logout(req, res, user.id);
    } else {
      res.status(401).send('Not logged in');
    }
  }
}
