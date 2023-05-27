import type { UserGame } from "./user.interface";

export interface GameInterface {
  id: string;
  status: GameStatus;
  createdAt: Date;
  updatedAt: Date;
  users: UserGame[];
  userGames?: UserGame[];
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

export interface GameStatistics {
  experience: number;
  totalGames: number;
  totalWins: number;
  totalLoses: number;
  averageScore: number;
  elo: number;
}

export interface Ball {
  xb: number;
  yb: number;
  x: number;
  y: number;
  width: number;
  velocityx: number;
  velocityy: number;
  rebound: number;
  rebonetime: number;
  speed: number;
  animation: number;
}

export interface CPU {
  enable: number;
  difficulty: number;
}

export interface Score {
  p1: number;
  p2: number;
  color: string;
  max_score: number;
  finish_game: number;
}

export interface Player {
  me: number;
  speed: number;
  tile: number;
  tilewidth: number;
  x: number;
  y: number;
  paddley: number;
  ply: number;
  id: string;
  ready: number;
  canvasY: number;
  canvasX: number;
  ratioY: number;
  ratioX: number;
}
