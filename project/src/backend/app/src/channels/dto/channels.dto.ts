import { UserChatPermission, UserChatStatus } from "@prisma/client";
import { IsString } from "class-validator";

export class CreateChannelDto {
    @IsString()
    userId: string;
}

export class JoinChannelDto {
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