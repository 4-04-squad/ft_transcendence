import { ChatType, UserChatPermission, UserChatStatus } from "@prisma/client";
import { IsAlphanumeric, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateChannelDto {
    @IsString()
    @MaxLength(40)
    @IsOptional()
    name?: string;
    type: ChatType;
    @IsString()
    password?: string;
}

export class JoinChannelDto {
    @IsString()
    @IsOptional()
    passwd?: string;
    @IsString()
    chatId: string;
}

export class EditChannelDto {
    @IsString()
    @MaxLength(40)
    @IsOptional()
    name?: string;
    @IsString()
    password?: string;
    type?: ChatType;
}

export class memberStatusDto {
    @IsString()
    chatId: string;

    @IsString()
    userId: string;

    status: UserChatStatus;

    permission: UserChatPermission;
}
