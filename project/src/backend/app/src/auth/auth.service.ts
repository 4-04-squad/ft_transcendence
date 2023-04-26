import { BadRequestException, Injectable, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async findOrCreate({ id, email, firstName, lastName, pseudo, fortyTwoId, avatar }: { id: string, email: string, firstName: string, lastName: string, pseudo: string, fortyTwoId: number, avatar: string}): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          fortyTwoId,
          pseudo,
          avatar,
        },
      });
    } else if (!user.fortyTwoId) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          fortyTwoId,
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

  async findUserByName(pseudo: string, password: string) {
    // Find current user
    const findUser = await this.prisma.user.findUnique({
      where: {
        pseudo
      }
    });

    if (findUser) {
      return findUser;
    }

    const userEmail = pseudo + "@testing.ch";
    return await this.prisma.user.create({
      data: {
        email: userEmail,
        password,
        pseudo,
        avatar: "/img/marvin.png"
      },
    });
  }

  async logout(req: Request, res: Response, id: string) {
    // Find current user
    const findUser = await this.prisma.user.findUnique({
      where: {
        id
      }
    });

    // Check user
    if (!findUser) {
      throw new BadRequestException("User not found.");
    }

    // Remove JWT token from cookie
    res.cookie(process.env.JWT_NAME, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 0,
    });
    return res.status(200).send('Sign out succes!');
  }

  verifyToken(token: string) {
    if (!token) {
      throw new BadRequestException('Token not found.');
    }
    return this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
  }
  
  createToken(user: any, tfa = false) {
    const payload = { email: user.email, sub: user.id, tfa};
    return {
      access_token: this.jwtService.sign(
        payload, 
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '1d',
        }
      ),
    }
  }

  createCookie(res: Response, user: any, tfa: boolean) {
    const token = this.createToken(user, tfa);

    // Check token
    if (!token) {
      throw new ForbiddenException('Forbidden, token is missing.');
    }

    console.log('JWT cookie:', token);
    
    // Set jwt cookie
    return res.cookie(process.env.JWT_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 86400000, // 1 day
    });
  }
}
