import type { UserGame } from "./user.interface";

export interface GameInterface {
  id: string;
  status: GameStatus;
  createdAt: Date;
  updatedAt: Date;
  users: UserGame[];
}

export const enum GameStatus {
  WAITING = "WAITING",
  INPROGRESS = "INPROGRESS",
  FINISHED = "FINISHED",
}

export interface IGameSettings {
  gameId: string;
  ballSize: number;
  ballSpeed: number;
  paddleSize: number;
  paddleSpeed: number;
  paddleColor: string;
  backgroundColor: string;
  ballColor: string;
  scoreLimit: number;
}

export interface IUserStats {
  userGamesStatistics: GameStatistics;
  allGamesStatistics: GameStatistics;
}

interface GameStatistics {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  averageScore: number;
}
