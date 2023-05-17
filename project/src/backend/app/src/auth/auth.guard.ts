import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { AuthMiddleware } from '../users/users.middleware';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private authMiddleware: AuthMiddleware;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {
    this.authMiddleware = new AuthMiddleware(authService, userService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse();
    const next = context.switchToHttp().getNext();

    await new Promise(resolve => this.authMiddleware.use(request, response, resolve));

    return !!request.user;
  }
}
