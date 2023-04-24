import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { toFileStream,toDataURL  } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
	constructor(
		private prisma: PrismaService,
		private readonly usersService: UsersService
	) { }

	public async generateTwoFactorAuthenticationSecret(user: any) {
		const secret = authenticator.generateSecret();
		console.log(secret);
		const otpauthUrl = authenticator.keyuri(user.email, process.env.TITLE, secret);

		await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);

		return {
			secret,
			otpauthUrl
		}
	}

	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toDataURL(otpauthUrl);
	}

	public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: any) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twofasecret
		})
	}
}