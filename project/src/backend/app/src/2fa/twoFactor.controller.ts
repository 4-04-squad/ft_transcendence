import {
	Controller,
	Post,
	Res,
	UseGuards,
	Req,
	Body,
	UnauthorizedException,
	ForbiddenException,
} from '@nestjs/common';
import { AuthMiddleware } from 'src/users/users.middleware';
import { TwoFactorAuthenticationService } from './twoFactor.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth/auth.service';

@Controller('2fa')
@ApiTags('2fa')
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private authMiddleware: AuthMiddleware,
		private usersService: UsersService,
		private authService: AuthService
	) { }

	@Post('generate')
	async register(@Res() res: Response, @Req() request: RequestWithUser) {
		await new Promise(resolve => this.authMiddleware.use(request, res, resolve));
		const user = request.user;
		if (!user) {
			res.status(401).send({ message: 'Unauthorized' });
		  } else {
			const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);

			const ret = await this.twoFactorAuthenticationService.pipeQrCodeStream(res, otpauthUrl);

			res.send({ ret });
		  }
	}

	@Post('turn-on')
	async turnOnTwoFactorAuthentication(
		@Req() request: RequestWithUser,
		@Res() res: Response,
		@Body() body: { tfa_code: string }
	) {
		await new Promise(resolve => this.authMiddleware.use(request, res, resolve));
		const user = request.user;
		console.log(body.tfa_code)

    	const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      		body.tfa_code, user
    	);
		console.log(isCodeValid);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.usersService.turnOnTwoFactorAuthentication(user.id);
	}

	@Post('authenticate')
	async authenticate(
		@Req() request: RequestWithUser,
		@Res() res: Response,
		@Body() body: { tfa_code: string }
	) {
		await new Promise(resolve => this.authMiddleware.use(request, res, resolve));
		const user = request.user;
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			body.tfa_code, request.user
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		
		// Set jwt cookie with 2fa
		res = this.authService.createCookie(res, user, true);
	
		res.send({ user });
	}
}