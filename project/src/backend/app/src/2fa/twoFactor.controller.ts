import {
	Controller,
	Post,
	Res,
	UseGuards,
	Req,
} from '@nestjs/common';
import { AuthMiddleware } from 'src/users/users.middleware';
import { TwoFactorAuthenticationService } from './twoFactor.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { ApiTags } from '@nestjs/swagger';

@Controller('2fa')
@ApiTags('2fa')
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private authMiddleware: AuthMiddleware,
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
			console.log(ret);
			return ret;
		  }
	}
}