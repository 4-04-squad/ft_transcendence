import { BadRequestException, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

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
      if (bcrypt.compareSync(password, findUser.password)) {
        return findUser;
      }
      else {
        throw new UnauthorizedException('Incorrect password.');
      }
    }
    else {
      const hash = bcrypt.hashSync(password, 10);

      const userEmail = pseudo + "@testing.ch";
      return await this.prisma.user.create({
        data: {
          email: userEmail,
          password: hash,
          pseudo,
          avatar: "/img/marvin.png"
        },
      });
    }
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

  verifyToken(token: string, tmp: boolean) {
    const secret = tmp ? process.env.JWT_TMP_SECRET : process.env.JWT_SECRET;
    return this.jwtService.verify(token, { secret });
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

  createTempToken(user: any, tfa = true) {
    const payload = { email: user.email, sub: user.id, tfa};
    return {
      access_token: this.jwtService.sign(
        payload, 
        {
          secret: process.env.JWT_TMP_SECRET,
          expiresIn: '10m',
        }
      ),
    }
  }
}
