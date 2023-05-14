import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class BlockUserService {
  constructor(private readonly prisma: PrismaService) {}

  async blockUser(currentUser: string, userId: string): Promise<boolean> {
    // Check if the user to be blocked exists
    const userToBlock = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!userToBlock) {
      throw new NotFoundException('User to block not found');
    }

    // Add the user to be blocked to the blockers array of the current user
    await this.prisma.user.update({
      where: { id: currentUser },
      data: { blocked: { connect: { id: userToBlock.id } } },
    });

    // is user blocked ?
    return await this.isBlocked(currentUser, userId);
  }

  async unblockUser(currentUser: string, userId: string): Promise<boolean> {
    // Check if the user to be unblocked exists
    const userToUnblock = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userToUnblock) {
      throw new NotFoundException('User to unblock not found');
    }

    // Remove the user to be unblocked from the blockers array of the current user
    await this.prisma.user.update({
      where: { id: currentUser },
      data: { blocked: { disconnect: { id: userToUnblock.id } } },
    });

   // is user unblocked ?
    return await this.isBlocked(currentUser, userId);
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const blockedUsers = await this.prisma.user.findMany({
      where: { blockers: { some: { id: userId } } },
    });

    return blockedUsers;
  }

  async isBlocked(userId: string, otherUserId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { blocked: true },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const blockedUserIds = user.blocked.map((blockedUser) => blockedUser.id);
  
    const isBlocked = blockedUserIds.includes(otherUserId);

    console.log(isBlocked);
  
    return isBlocked;
  }
  
}
