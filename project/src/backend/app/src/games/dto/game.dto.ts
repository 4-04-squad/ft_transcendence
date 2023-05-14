import { ApiProperty } from '@nestjs/swagger';
import { GameStatus } from '@prisma/client';

export class GameDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  status: GameStatus;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}

export class UserGameDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  status: UserGameStatusDto;
  @ApiProperty()
  score: number;
  @ApiProperty()
  gameId: string;
  @ApiProperty()
  userId: string;
}

enum UserGameStatusDto {
  WINNER = 'WINNER',
  LOSER = 'LOSER',
  DRAW = 'DRAW',
}
