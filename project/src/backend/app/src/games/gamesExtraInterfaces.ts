import { Game, UserGame, User } from "@prisma/client";

export interface GameWithUsers extends Game {
	userGames: UserGame[];
	users: User[];
}
  