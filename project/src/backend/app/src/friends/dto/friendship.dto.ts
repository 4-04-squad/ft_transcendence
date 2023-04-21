import { ApiProperty } from '@nestjs/swagger';

export class FriendRequestDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  friendId: string;
}

export class FriendUpdateDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  friendId: string;

  @ApiProperty()
  accepted: boolean;
}
