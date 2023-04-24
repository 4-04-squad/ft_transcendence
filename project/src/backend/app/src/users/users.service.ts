import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, UserStatus } from '@prisma/client';
import { CreateUserDto, GetUserByIdDto, UpdateUserDto, UserInputDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  remove: any;
  constructor(private prisma: PrismaService) { }

  async setTwoFactorAuthenticationSecret(secret: string, id: string) {
    let user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        twofasecret: secret,
      },
    });
    return user;
  }

  async turnOnTwoFactorAuthentication(id: string) {
    let user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        twofaenabled: true,
      },
    });
    return user;
  }

  async findOrCreate(userInputDto: UserInputDto): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: {
        email: userInputDto.email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: userInputDto.email,
          firstName: userInputDto.firstName,
          lastName: userInputDto.lastName,
          fortyTwoId: userInputDto.fortyTwoId,
          pseudo: userInputDto.pseudo,
          avatar: userInputDto.avatar
        },
      });
    } else if (!user.fortyTwoId) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          fortyTwoId: userInputDto.fortyTwoId,
        },
      });
    }

    return user;
  }

  async findUserById(id: string): Promise<any> {
    const findUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!findUser) {
      throw new BadRequestException('User not found.');
    }

    return findUser;
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async getAllUsers(): Promise<User[]> {
    const findUsers = await this.prisma.user.findMany();

    if (!findUsers) {
      throw new BadRequestException('No users found.');
    }

    return findUsers;
  }

  async getUsersByStatus(status: string, limit: string, currentUserId: string): Promise<User[]> {
    const statusEnum = UserStatus[status];

    const users = await this.prisma.user.findMany({
      where: {
        status: statusEnum,
        id: { not: currentUserId },
      },
      take: limit ? parseInt(limit.toString()) : undefined,
    });

    return users;
  }

  async getUserById(userId: string): Promise<GetUserByIdDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { pseudo: userId }
        ]
      }
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const userDto: GetUserByIdDto = {
      id: user.id,
      fortyTwoId: user.fortyTwoId,
      pseudo: user.pseudo,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      about: user.about,
      experience: user.experience,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userDto;
  }

  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteUser(userId: string): Promise<User> {
    // Delete user from database
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });

    // check if user was deleted
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    return user;
  }

  async updateUserAvatar(userId: string, file: Express.Multer.File) : Promise<User> {
    const { filename, mimetype } = file;
    const avatarUrl = `${process.env.API_URL}/uploads/${filename}`;
  
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }
}

