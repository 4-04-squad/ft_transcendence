import { ChatType, UserChatPermission, UserChatStatus } from "@prisma/client";
import { IsString } from "class-validator";

export class CreateChannelDto {
    @IsString()
    name?: string;
    type: ChatType;
    @IsString()
    password?: string;
}

export class JoinChannelDto {
    @IsString()
    passwd?: string;
    @IsString()
    chatId: string;
}


export class memberStatusDto {
    @IsString()
    chatId: string;

    @IsString()
    userId: string;

    status: UserChatStatus;

    permission: UserChatPermission;
}

// export class UpdateChannelDto {
//     @IsString()
//     chatId: string;

//     // add more fields here (data: { ... })
// }

// export class DeleteChannelDto {
//     @IsString()
//     chatId: string;

//     @IsString()
//     userId: string;
// }