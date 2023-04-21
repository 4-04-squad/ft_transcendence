import { IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {

  @IsString()
  userId: string;
}