import { IsString, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  chatId: string;

  @IsString()
  userId: string;
}
