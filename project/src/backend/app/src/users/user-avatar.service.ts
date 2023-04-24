import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { createWriteStream } from 'fs';
import { v4 as uuid } from 'uuid';
import type { Multer } from 'multer';

@Injectable()
export class UserAvatarService {
  constructor(private prisma: PrismaService) {}

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    const { filename, path } = file;
    const [name, ext] = filename.split('.');
    const avatarName = `${name}-${uuid()}.${ext}`;

    const writeStream = createWriteStream(`./uploads/${avatarName}`);
    writeStream.write(file.buffer);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarName },
    });

    return user.avatar;
  }
}
