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
    const token = req.cookies[process.env.JWT_NAME];
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized, no token found.' });
    }
    try {
      const decodedToken = this.authService.verifyToken(token.access_token);
      const user = await this.userService.findUserById(decodedToken.sub);
      if (user) {
        req.user = user;
      }
      next();
    } catch (error) {
      res.clearCookie(process.env.JWT_NAME);
      return res.status(401).send({ message: 'Unauthorized, invalid token.'	 });
    }
  }
}