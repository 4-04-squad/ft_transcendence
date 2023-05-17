import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class BlockUserService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkUserExists(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async blockUser(currentUser: string, userId: string): Promise<void> {
    await this.checkUserExists(userId);
    await this.prisma.user.update({
      where: { id: currentUser },
      data: { blocked: { connect: { id: userId } } },
    });
  }

  async unblockUser(currentUser: string, userId: string): Promise<void> {
    await this.checkUserExists(userId);
    await this.prisma.user.update({
      where: { id: currentUser },
      data: { blocked: { disconnect: { id: userId } } },
    });
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    const user = await this.checkUserExists(userId);
    const blockedUsers = await this.prisma.user.findMany({
      where: { blockers: { some: { id: userId } } },
    });
    return blockedUsers;
  }

  async isBlocked(userId: string, otherUserId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        blocked: {
          select: { id: true },
          where: { id: otherUserId },
        },
      },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user.blocked.length > 0;
  }
  
}
