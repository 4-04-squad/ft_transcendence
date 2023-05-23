import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Game, GameStatus, UserGame } from '@prisma/client';
import { GameWithUsers } from './gamesExtraInterfaces';
import { GamesStatisticsDto, UserGameDto, gameSettingsDto } from './dto/game.dto';

@Injectable()
export class GamesService {
  remove: any;
  constructor(private prisma: PrismaService) {}

  async getAllGames(): Promise<GameWithUsers[]> {
    const games = await this.prisma.game.findMany().catch((err) => {
      throw new BadRequestException(err);
    });

    const userGames = await this.prisma.userGame
      .findMany({ where: { gameId: { in: games.map((game) => game.id) } } })
      .catch((err) => {
        throw new BadRequestException(err);
      });

    const users = await this.prisma.user
      .findMany({
        where: { id: { in: userGames.map((userGame) => userGame.userId) } },
      })
      .catch((err) => {
        throw new BadRequestException(err);
      });

    const gamesWithUsers = games.map((game) => {
      return {
        ...game,
        userGames: userGames.filter((userGame) => userGame.gameId == game.id),
        users: users.filter((user) =>
          userGames.some(
            (userGame) =>
              userGame.userId == user.id && userGame.gameId == game.id,
          ),
        ),
      };
    });

    return gamesWithUsers;
  }

  async getGameById(gameId: string): Promise<GameWithUsers> {
    const game = await this.prisma.game
      .findUnique({ where: { id: gameId } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const userGames = await this.prisma.userGame
      .findMany({ where: { gameId: gameId } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const users = await this.prisma.user
      .findMany({
        where: { id: { in: userGames.map((userGame) => userGame.userId) } },
      })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    return { ...game, userGames: userGames, users: users };
  }

  async getGameByUserId(userId: string): Promise<Game[] | void> {
    const userGames = await this.prisma.userGame
      .findMany({ where: { userId: userId } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const games = await this.prisma.game
      .findMany({
        where: { id: { in: userGames.map((userGame) => userGame.gameId) } },
      })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    return games;
  }

  async getGameByStatus(status: string): Promise<GameWithUsers[]> {
    if (
      status != GameStatus.WAITING &&
      status != GameStatus.INPROGRESS &&
      status != GameStatus.FINISHED
    )
      throw new BadRequestException('Invalid status');
    const games = await this.prisma.game
      .findMany({ where: { status: status } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const userGames = await this.prisma.userGame
      .findMany({ where: { gameId: { in: games.map((game) => game.id) } } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const users = await this.prisma.user
      .findMany({
        where: { id: { in: userGames.map((userGame) => userGame.userId) } },
      })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const gamesWithUsers = games.map((game) => {
      return {
        ...game,
        userGames: userGames.filter((userGame) => userGame.gameId == game.id),
        users: users.filter((user) =>
          userGames.some(
            (userGame) =>
              userGame.userId == user.id && userGame.gameId == game.id,
          ),
        ),
      };
    });
    return gamesWithUsers;
  }

  async getGamesStatistics(userId: string): Promise<GamesStatisticsDto> {
    const user = await this.prisma.user
      .findUnique({ where: { id: userId } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const allUser = await this.prisma.user.findMany().catch((err) => {
      throw new BadRequestException(err);
    });
    const userGames = await this.prisma.userGame
      .findMany({ where: { userId: userId } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const games = await this.prisma.game
      .findMany({
        where: { id: { in: userGames.map((userGame) => userGame.gameId) } },
      })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const userGamesStatistics = {
      totalGames: games.length,
      totalWins: userGames.filter((userGame) => userGame.status == 'WINNER')
        .length,
      totalLoses: userGames.filter((userGame) => userGame.status == 'LOSER')
        .length,
      averageScore: userGames.reduce((a, b) => a + b.score, 0) / games.length,
      elo: user.experience,
    };
    const allUserGames = await this.prisma.userGame.findMany().catch((err) => {
      throw new BadRequestException(err);
    });
    const allGames = await this.prisma.game.findMany().catch((err) => {
      throw new BadRequestException(err);
    });
    const allGamesStatistics = {
      totalGames: allGames.length,
      totalWins: allUserGames.filter((userGame) => userGame.status == 'WINNER')
        .length,
      totalLoses: allUserGames.filter((userGame) => userGame.status == 'LOSER')
        .length,
      averageScore:
        allUserGames.reduce((a, b) => a + b.score, 0) / allGames.length,
      elo: allUser.reduce((a, b) => a + b.experience, 0) / allUser.length,
    };
    const gamesStatistics = {
      userGamesStatistics: userGamesStatistics,
      allGamesStatistics: allGamesStatistics,
    };
    return gamesStatistics;
  }

  async create(userId: string, data?: gameSettingsDto): Promise<Game | void> {
    const game = await this.prisma.game
      .create({
        data: {
          status: GameStatus.WAITING,
          ownerId: userId,
          ballSize: data.ballSize,
          ballSpeed: data.ballSpeed,
          paddleSize: data.paddleSize,
          paddleSpeed: data.paddleSpeed,
          paddleColor: data.paddleColor,
          backgroundColor: data.backgroundColor,
          ballColor: data.ballColor,
          scoreLimit: data.scoreLimit,
        },
      })
      .then((game) => {
        this.createUserGame(game.id, userId);
        return game;
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(err);
      });
    return game;
  }

  // new user join a game
  async joinGame(gameId: string, userId: string): Promise<Game | void> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    // check if that the user is not already in the game
    const userGame = await this.prisma.userGame.findMany({
      where: { gameId: gameId, userId: userId },
    });
    if (userGame.length > 0)
      throw new BadRequestException('User already in the game');

    if (
      game.status == GameStatus.FINISHED ||
      game.status == GameStatus.INPROGRESS
    )
      throw new BadRequestException('Game is already in progress or finished');

    this.createUserGame(gameId, userId);

    return await this.prisma.game
      .update({
        where: { id: gameId },
        data: { status: GameStatus.INPROGRESS },
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(err);
      });
  }

  async endGame(
    gameId: string,
    userGames: UserGameDto[],
  ): Promise<Game | void> {
    if (userGames.length != 2)
      throw new BadRequestException('Invalid number of players');
    const game = await this.prisma.game
      .update({
        where: { id: gameId },
        data: { status: GameStatus.FINISHED },
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(err);
      });
    await this.prisma.userGame
      .update({
        where: { id: userGames[0].id },
        data: { status: userGames[0].status, score: userGames[0].score },
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(err);
      });
    await this.prisma.userGame
      .update({
        where: { id: userGames[0].id },
        data: { status: userGames[1].status, score: userGames[1].score },
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(err);
      });
    // TODO Yacine: this should update the user's elo as well
    return game;
  }

  async createUserGame(
    gameId: string,
    userId: string,
  ): Promise<UserGame | void> {
    return await this.prisma.userGame
      .create({
        data: {
          userId: userId,
          gameId: gameId,
        },
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(err);
      });
  }

  async deleteGame(gameId: string, userId: string): Promise<Game | null> {
    const user = await this.prisma.user
      .findUnique({ where: { id: userId } })
      .catch((err) => {
        throw new BadRequestException(err);
      });

    // We only allow admin to delete a game or a user that is associated with the game (that might change in the future)
    if (user.role != 'ADMIN') {
      const userGame = await this.prisma.userGame.findMany({
        where: { gameId: gameId, userId: userId },
      });
      if (userGame.length == 0)
        throw new BadRequestException('User is not associated with the game');
    }
    await this.prisma.userGame
      .deleteMany({ where: { gameId: gameId } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    const deleted = this.prisma.game
      .delete({ where: { id: gameId } })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    return deleted;
  }
}
