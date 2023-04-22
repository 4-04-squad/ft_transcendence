import { Body, Controller, Delete, Get, Param, Post, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { GamesService } from './games.service';
import { JoinGameDto } from './dto/joinGame.dto';
import { AuthMiddleware } from 'src/users/users.middleware';
import { Response } from 'express';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
import { ApiTags, ApiBody, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { GameDto } from './dto/game.dto';

@Controller('games')
@ApiTags('Games')
@ApiResponse({ status: 401, description: 'Unauthorized'})
export class GamesController {
  constructor(
    private gamesService: GamesService,
    private authMiddleware: AuthMiddleware,
    ) {}


  @Get()
  @ApiOkResponse({description: 'Returns an Array of games', type: GameDto, isArray: true })
  async getAllGames(@Req() req: RequestWithUser, @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.getAllGames();
      res.send({ games });
    }
  }

  @Get(':userId/user')
  @ApiOkResponse({description: 'Returns a game', type: GameDto })
  async getGamesByUser(@Param('userId') userId: string, @Req() req: RequestWithUser, @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.getGameByUserId(userId);
      res.send({ games });
    }
  }

  @Get(':status/status')
  @ApiOkResponse({description: 'Returns an Array of games matching status', type: GameDto, isArray: true })
  async getGameByStatus(@Req() req: RequestWithUser, @Res() res: Response, @Param('status') status: string) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.getGameByStatus(status);
      res.send({ games });
    }
  }

  @Get(':gameId')
  @ApiOkResponse({description: 'Returns a game matching gameID', type: GameDto })
  async getGameById(@Req() req: RequestWithUser, @Res() res: Response, @Param('gameId') gameId: string) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.getGameById(gameId);
      res.send({ games });
    }
  } 

  @Post('/create')
  @ApiOkResponse({description: 'Returns a game', type: GameDto })
  async createGame(@Req() req: RequestWithUser, @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.create(user.id);
      res.send({ games });
    }
  }

  @Post('join')
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 400, description: 'User already in the game'})
  async joinGame(@Req() req: RequestWithUser, @Body() data: JoinGameDto,  @Res() res: Response) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.joinGame(data.gameId, user.id);
      res.send({ games });
    }
  }

  @Delete(':gameId')
  async deleteGame(@Req() req: RequestWithUser, @Res() res: Response, @Param('gameId') gameId: string) {
    await new Promise(resolve => this.authMiddleware.use(req, res, resolve));
    const user = req.user;
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' });
    } else {
      const games =  await this.gamesService.deleteGame(gameId, user.id);
      res.send({ games });
    }
  }
}
