import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class BlockUserService {
  constructor(private readonly prisma: PrismaService) {}

  async blockUser(userId: string): Promise<void> {
    // Check if the user to be blocked exists
    const userToBlock = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userToBlock) {
      throw new NotFoundException('User not found');
    }

    // Find the current user (the one performing the block)
    const currentUser = await this.prisma.user.findUnique({ where: { id: 'CURRENT_USER_ID' } });
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    // Add the user to be blocked to the blockers array of the current user
    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: { blockers: { connect: { id: userToBlock.id } } },
    });
  }

  async unblockUser(userId: string): Promise<void> {
    // Check if the user to be unblocked exists
    const userToUnblock = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userToUnblock) {
      throw new NotFoundException('User not found');
    }

    // Find the current user (the one performing the unblock)
    const currentUser = await this.prisma.user.findUnique({ where: { id: 'CURRENT_USER_ID' } });
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    // Remove the user to be unblocked from the blockers array of the current user
    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: { blockers: { disconnect: { id: userToUnblock.id } } },
    });
  }

  // Get all users that the current user has blocked
  async getBlockedUsers(userId: string): Promise<User[]> {
    const blockedUsers = await this.prisma.user
      .findUnique({ where: { id: userId } })
      .blocked();

    return blockedUsers;
  }

    // Check if the current user has blocked the other user
    async isBlocked(userId: string, otherUserId: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                blockers: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const blockedUsers = user.blockers;
        const isBlocked = blockedUsers.some((user) => user.id === otherUserId);

        return isBlocked;
    }
}