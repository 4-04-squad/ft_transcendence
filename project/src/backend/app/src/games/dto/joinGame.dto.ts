import { IsEmpty, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class JoinGameDto {
	@IsString()
	@IsNotEmpty({ message: 'Game id is required' })
	@ApiProperty()
	gameId: string;
}