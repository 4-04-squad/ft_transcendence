import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { JoinGameDto } from './dto/joinGame.dto';
import { AuthMiddleware } from 'src/users/users.middleware';
import { Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { ApiTags, ApiBody, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { GameDto, UserGameDto } from './dto/game.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('games')
@ApiTags('Games')
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class GamesController {
  constructor(
    private gamesService: GamesService,
    private authMiddleware: AuthMiddleware,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: 'Returns an Array of games',
    type: GameDto,
    isArray: true,
  })
  async getAllGames(@Req() req: RequestWithUser, @Res() res: Response) {
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games = await this.gamesService.getAllGames();
      res.send({ games });
    }
  }

  @Get(':userId/user')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Returns a game', type: GameDto })
  async getGamesByUser(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games = await this.gamesService.getGameByUserId(userId);
      res.send({ games });
    }
  }

  @Get(':status/status')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: 'Returns an Array of games matching status',
    type: GameDto,
    isArray: true,
  })
  async getGameByStatus(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Param('status') status: string,
  ) {
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games = await this.gamesService.getGameByStatus(status);
      res.send({ games });
    }
  }

  @Get(':gameId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: 'Returns a game matching gameID',
    type: GameDto,
  })
  async getGameById(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Param('gameId') gameId: string,
  ) {
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games = await this.gamesService.getGameById(gameId);
      res.send({ games });
    }
  }

  @Get(':userId/statistics')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: 'Returns a game matching gameID',
  })
  async getGameStatisticsByUser(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Param('userId') userId: string,
  ) {
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const statistics = await this.gamesService.getGamesStatistics(userId);
      res.send({ statistics, message: 'Statistics created' });
    }
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Returns a game', type: GameDto })
  async createGame(@Req() req: RequestWithUser, @Res() res: Response) {
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games = await this.gamesService.create(user.id);
      res.send({ games, message: 'Game created' });
    }
  }

  @Post('join')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 400, description: 'User already in the game' })
  async joinGame(
    @Req() req: RequestWithUser,
    @Body() data: JoinGameDto,
    @Res() res: Response,
  ) {
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games = await this.gamesService.joinGame(data.gameId, user.id);
      res.send({ games, message: 'Game joined' });
    }
  }

  @Patch(':gameId/end')
  @UsePipes(ValidationPipe)
  @ApiOkResponse({ description: 'Returns a game', type: GameDto })
  async endGame(
    @Req() req: RequestWithUser,
    @Body() data: UserGameDto[],
    @Res() res: Response,
    @Param('gameId') gameId: string,
  ) {
    await new Promise((resolve) => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const game = await this.gamesService.endGame(gameId, data);
      res.send({ game, message: 'Game Ended' });
    }
  }

  @Delete(':gameId')
  @UseGuards(AuthGuard)
  async deleteGame(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Param('gameId') gameId: string,
  ) {
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games = await this.gamesService.deleteGame(gameId, user.id);
      res.send({ games });
    }
  }
}
