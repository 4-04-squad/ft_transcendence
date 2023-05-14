import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { BlockUserService } from './block-user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class BlockUserController {
  constructor(private readonly blockUserService: BlockUserService) {}

  @Post(':id/block')
  @UseGuards(AuthGuard())
  async blockUser(@Param('id') userId: string): Promise<void> {
    await this.blockUserService.blockUser(userId);
  }

  @Post(':id/unblock')
  @UseGuards(AuthGuard())
  async unblockUser(@Param('id') userId: string): Promise<void> {
    await this.blockUserService.unblockUser(userId);
  }
}