import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fortyTwoId: number | null;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty()
  avatar: string | null;

  @ApiProperty()
  about: string | null;

  @ApiProperty()
  experience: number;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserInputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  fortyTwoId: number;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  avatar: string;
}

export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty()
  fortyTwoId: number | null;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  avatar: string | null;

  @ApiProperty()
  about: string | null;

  @ApiProperty()
  experience: number;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  role: UserRole;
}

export class GetUserByIdDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fortyTwoId: number | null;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty()
  avatar: string | null;

  @ApiProperty()
  about: string | null;

  @ApiProperty()
  experience: number;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}


export class UpdateUserDto {
  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  fortyTwoId?: number;

  @ApiProperty()
  pseudo?: string;

  @ApiProperty()
  avatar?: string;

  @ApiProperty()
  twofasecret?: string;
}  
