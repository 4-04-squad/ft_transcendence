import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { User } from '@prisma/client';
import { createWriteStream } from 'fs';
import { v4 as uuid } from 'uuid';
import type { Multer } from 'multer';

@Injectable()
export class UserAvatarService {
  constructor(private prisma: PrismaService) {}

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const extension = file.originalname.split('.').pop();
    const filename = `${uuid()}.${extension}`;
    const filePath = `uploads/${filename}`;

    await new Promise((resolve, reject) =>
      createWriteStream(filePath)
        .on('finish', resolve)
        .on('error', reject)
        .write(file.buffer),
    );

    const avatar = `${process.env.API_URL}/${filePath}`;
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar },
    });

    return avatar;
  }

  async getAvatarUrl(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.avatar) {
      return null;
    }

    return user.avatar;
  }
}
