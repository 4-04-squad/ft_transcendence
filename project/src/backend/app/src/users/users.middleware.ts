import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { Response, NextFunction } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const jwtName = process.env.JWT_NAME;
    const jwtTmpName = process.env.JWT_TMP_NAME;
    const token = req.cookies[jwtName];
    const tmpToken = req.cookies[jwtTmpName];
  
    if (!token && !tmpToken) {
      return res.status(401).send({ message: 'Unauthorized, no token found.' });
    }
  
    let decodedToken;
    let isTmpToken = false;
  
    try {
      if (token) {
        decodedToken = this.authService.verifyToken(token.access_token, false);
      } else {
        decodedToken = this.authService.verifyToken(tmpToken.access_token, true);
        isTmpToken = true;
      }
  
      const user = await this.userService.findUserById(decodedToken.sub);
  
      if (user) {
        req.user = user;
      }
  
      next();
    } catch (error) {
      if (isTmpToken) {
        res.clearCookie(jwtTmpName);
      } else {
        res.clearCookie(jwtName);
      }
  
      return res.status(401).send({ message: 'Unauthorized, invalid token.' });
    }
  }
}