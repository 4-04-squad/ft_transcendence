import { BadRequestException, Injectable } from '@nestjs/common';
import { Friendship, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FriendsService {
    constructor(private prisma: PrismaService) { }

    async getFriendsStatus(userId: string, friendId: string): Promise<Boolean> {
        // Check if friendId exists
        const friend = await this.prisma.user.findUnique({
            where: {
                id: friendId,
            },
        });

        if (!friend) {
            throw new BadRequestException('User not found.');
        }

        // Check if already friends
        const isAlreadyFriends = await this.prisma.friendship.findUnique({
            where: {
                userId_friendId: {
                    userId,
                    friendId,
                },
            },
        });

        // check if other way as well
        const isAlreadyFriends2 = await this.prisma.friendship.findUnique({
            where: {
                userId_friendId: {
                    userId: friendId,
                    friendId: userId,
                },
            },
        });

        if (isAlreadyFriends && isAlreadyFriends.accepted) {
            return true;
        }

        if (isAlreadyFriends2 && isAlreadyFriends2.accepted) {
            return true;
        }

        return false;
    }
    
    async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
        // Check if friendId exists
        const friend = await this.prisma.user.findUnique({
          where: {
            id: friendId,
          },
        });
    
        if (!friend) {
          throw new BadRequestException('User not found.');
        }
    
        // Check if already friends
        const isAlreadyFriends = await this.getFriendsStatus(userId, friendId);

        if (isAlreadyFriends) {
            throw new BadRequestException('Already friends.');
        }
    
        // create friendship
        const friendship = await this.prisma.friendship.create({
          data: {
            userId,
            friendId,
          },
        });

          return friendship;
        }
    
      // User sending the requests
      async getFriendRequests(userId: string): Promise<Friendship[]> {
        const friendRequests = await this.prisma.friendship.findMany({
            where: {
                userId: userId,
                accepted: false,
            },
            include: {
                friend: true,
            },
        });
        return friendRequests;
    }
    
      // User receiving the requests
      async getIncomingFriendRequests(userId: string): Promise<Friendship[]> {
        const incomingFriendRequests = await this.prisma.friendship.findMany({
          where: {
            friendId: userId,
            accepted: false,
          },
          include: {
            user: true,
          },
        });
        return incomingFriendRequests;
      }  
    
      async acceptFriendRequest(userId: string, friendId: string) {
        // Check if friendId exists
        const friend = await this.prisma.user.findUnique({
          where: {
            id: friendId,
          },
        });
    
        if (!friend) {
          throw new BadRequestException('User not found.');
        }
    
        // Check if already friends
        const isAlreadyFriends = await this.getFriendsStatus(userId, friendId);

        if (isAlreadyFriends) {
            throw new BadRequestException('Already friends.');
        }

        // Create friendship in other direction
        await this.prisma.friendship.update({
          where: {
            userId_friendId: { 
              userId: friendId,
              friendId: userId,
            },
          },
          data: {
            accepted: true,
          },
        });

        // Accept friend request
        await this.prisma.friendship.create({
          data: {
            userId,
            friendId,
            accepted: true,
          },
        });
      }

      async cancelFriendRequest(userId: string, friendId: string) {
        // Check if friendId exists
        const friend = await this.prisma.user.findUnique({
          where: {
            id: friendId,
          },
        });
    
        if (!friend) {
          throw new BadRequestException('User not found.');
        }
    
        // Check if already friends
        const isAlreadyFriends = await this.getFriendsStatus(userId, friendId);

        if (isAlreadyFriends) {
            throw new BadRequestException('Already friends.');
        }

        // Get who sent the request
        const friendship = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId,
              friendId,
            },
          },
        });

        if (!friendship) {
          await this.prisma.friendship.delete({
            where: {
              userId_friendId: {
                userId: friendId,
                friendId: userId,
              },
            },
          });
        } else {
          await this.prisma.friendship.delete({
            where: {
              userId_friendId: {
                userId,
                friendId,
              },
            },
          });
        }        
        
      }
    
      async unfriendUser(userId: string, friendId: string) {
        // Check if friendId exists
        const friend = await this.prisma.user.findUnique({
          where: {
            id: friendId,
          },
        });
    
        if (!friend) {
          throw new BadRequestException('User not found.');
        }
    
        // Check if already friends
        const isAlreadyFriends = await this.getFriendsStatus(userId, friendId);

        if (!isAlreadyFriends) {
            throw new BadRequestException('Not friends.');
        }
    
        // Unfriend user
        await this.prisma.friendship.delete({
          where: {
            userId_friendId: {
              userId,
              friendId,
            },
          },
        });

        await this.prisma.friendship.delete({
          where: {
            userId_friendId: {
              userId: friendId,
              friendId: userId,
            },
          },
        });
      }
    
      async getFriends(userId: string): Promise<User[]> {
        const friendships = await this.prisma.friendship.findMany({
          where: {
            userId: userId,
            accepted: true,
          },
          include: {
            friend: true,
          },
        });
        const friends = friendships.map((friendship) => friendship.friend);
        return friends;
      }

      async getFriendship(userId: string, friendId: string): Promise<Friendship> {
        const friendship = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId,
              friendId,
            },
          },
        });

        // check if other way as well
        const friendship2 = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId: friendId,
              friendId: userId,
            },
          },
        });

        return friendship || friendship2;
      }

      async getAllFriendships(userId: string): Promise<User[]> {
        // return all accepted friendships users
        const friendships = await this.prisma.friendship.findMany({
          where: {
            userId: userId,
            accepted: true,
          },
          include: {
            friend: true,
          },
        });
        const friends = friendships.map((friendship) => friendship.friend);

        return friends;
      }
}