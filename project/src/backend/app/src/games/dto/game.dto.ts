import { ApiProperty } from '@nestjs/swagger';
import { GameStatus } from '@prisma/client';

export class GameDto {
    @ApiProperty()
    id: string
    @ApiProperty()
    status: GameStatus
    @ApiProperty()
    createdAt: Date
    @ApiProperty()
    updatedAt: Date
}