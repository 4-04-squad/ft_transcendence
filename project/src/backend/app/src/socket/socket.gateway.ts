import { MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket as BaseSocket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Body, Logger, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, UserStatus, Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { clear } from 'console';

interface Socket extends BaseSocket {
  user?: User;
}

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  },
})
export class SocketsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}
  
  private logger: Logger = new Logger('SocketGateway');

  private connectedRooms = new Map<string, Set<string>>();
  private connectedClients = new Set<string>();

  @WebSocketServer() server;

  afterInit(server: any) {
    this.logger.log('WebSocket server initialized');
  }
  
  

  async handleConnection(socket: Socket, ...args: any[]) {
    const jwtName = process.env.JWT_NAME;
    
    if (!socket.handshake.headers.cookie) {
      socket.disconnect(true); // disconnect the socket
      return; // return from the function to stop further execution
    }

    const cookie = socket.handshake.headers.cookie.split(';').find(cookie => cookie.trim().startsWith(jwtName));

    if (!cookie) {
      socket.disconnect(true);
      return;
    }

    let token = cookie.split('=')[1];
    token = decodeURIComponent(token);

    try {
      token = JSON.parse(token.slice(2)).access_token;
    } catch (err) {
      socket.disconnect(true);
      return;
    }

    const decodedToken = this.authService.verifyToken(token, false);

    if (decodedToken.exp < Date.now() / 1000) {
      socket.emit('clearToken');
      socket.disconnect(true);
      return ;
    }
    
    if (!decodedToken) {
      socket.disconnect(true);
      return ;
    }

    try {
      const user = await this.usersService.findUserById(decodedToken.sub);
      if (!user) {
        socket.disconnect(true);
        return ;
      }

      socket.user = user;
    } catch (err) {
      socket.emit('clearToken');
      socket.disconnect(true);
      return ;
    }

    // Now do the normal connection handling
    if (!this.connectedClients.has(socket.id)) {
      this.connectedClients.add(socket.id);
      this.logger.log(`Client connected: ${socket.id}`);
    }
  }
  
  async handleDisconnect(socket: Socket) {
    if (this.connectedClients.has(socket.id)) {
      this.connectedClients.delete(socket.id);
      this.logger.log(`Client disconnected: ${socket.id}`);
    }
  }

  /*
  * Emit action : User status
  */
  @SubscribeMessage('tockenValid')
  onTokenValid(@MessageBody() data: { userId: string, status: string }) {
    this.server.emit('tockenValid', { userId: data.userId, status: data.status });
  }

  @SubscribeMessage('userStatus')
  onUserStatus(@MessageBody() data: { userId: string, status: string }) {
    this.server.emit('userStatus', { userId: data.userId, status: data.status });
  }

  @SubscribeMessage('joinOnline')
  onJoinOnline(client: Socket, data: { user: any }) {
    this.logger.log(`Client ${data.user.id} joined online`);
    this.server.emit('joinOnline', { user: data.user });
    this.server.emit('sendNotif', { sender: data.user, type: "online" });
  }

  @SubscribeMessage('leaveOnline')
  onLeaveOnline(client: Socket, data: { user: any }) {
    this.logger.log(`Client ${data.user.id} left online`);
    this.server.emit('leaveOnline', { user: data.user });

    // disconnect socket if user is not connected
    if (this.connectedClients.has(client.id)) {
      this.connectedClients.delete(client.id);
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  /*
  * Emit action : FriendRequest
  */
  @SubscribeMessage('updateFriends')
  onUpdateFriends(@Body() data: { updatedAt: string }) {
    this.server.emit('updateFriends', { updatedAt: data.updatedAt });
  }


  /*
  * Emit action : Notif
  */
  @SubscribeMessage('sendNotif')
  onSendNotif(@Body() data: { userId: string, linkId: string, sender: any, msg: string, type: string }) {
    // emit in room
    this.server.emit('sendNotif', { userId: data.userId, linkId: data.linkId, sender: data.sender, msg: data.msg, type: data.type });
  }


  /*
  * Emit action : GAME
  */

  // new game
  createSocketGame(gameId: string) {
    const roomName = `${gameId}`;
    this.server.to(roomName).emit('newGame', { gameId });
  }

  // delete game
  deleteSocketGame(gameId: string) {
    const roomName = `${gameId}`;
    this.server.to(roomName).emit('deleteGame', { gameId });
  }

  // join game
  joinSocketGame(gameId: string, userId: string) {
    const roomName = `${gameId}`;
    this.server.to(roomName).emit('joinGame', { gameId, userId });
  }

  // leave game
  leaveSocketGame(gameId: string, userId: string) {
    const roomName = `${gameId}`;
    this.server.to(roomName).emit('leaveGame', { gameId, userId });
  }

  // move ball
  moveBall(gameId: string, x: number, y: number) {
    const roomName = `${gameId}`;
    // emit in room
    this.server.to(roomName).emit('moveBall', { gameId, x, y });
  }


  /*
  * Handle action
  */
  @SubscribeMessage('sendCanvasSizeP1')
  sendCanvasSizeP1(client: Socket, data: { gameId: string, userId: string, width: any, height: any }) {
    const roomName = `${data.gameId}`;
    // emit in room
    this.server.to(roomName).emit('sendCanvasSizeP1', { gameId: data.gameId, userId: data.userId, width: data.width, height: data.height });
  }

  @SubscribeMessage('sendCanvasSizeP2')
  sendCanvasSizeP2(client: Socket, data: { gameId: string, userId: string, width: any, height: any }) {
    const roomName = `${data.gameId}`;
    // emit in room
    this.server.to(roomName).emit('sendCanvasSizeP2', { gameId: data.gameId, userId: data.userId, width: data.width, height: data.height });
  }

  @SubscribeMessage('createGame')
  onCreateGame(@Body() data: { updatedAt: string }) {
    // emit to all online users
    this.server.emit('createGame', { updatedAt: data.updatedAt });
  }

  @SubscribeMessage('ready')
  onReady(@Body() data: { gameId: string, userId: string }) {
    const roomName = `${data.gameId}`;
    // emit in room
    this.server.to(roomName).emit('ready', { gameId: data.gameId, userId: data.userId });
  }

  @SubscribeMessage('redirectToGameRoom')
  onRedirectToGameRoom(client: Socket, data: { gameId: string, userId: string }) {
    this.server.emit('redirectToGameRoom', { gameId: data.gameId, userId: data.userId });
  }

  @SubscribeMessage('joinGame')
  onJoinGame(client: Socket, data: { gameId: string, userId: string }) {
    const roomName = `${data.gameId}`;
    const userRooms = this.connectedRooms.get(data.userId) || new Set<string>();

    if (userRooms.has(roomName)) {
      return;
    }

    client.join(roomName);
    this.logger.log(`Client ${data.userId} joined game ${data.gameId}`);

    userRooms.add(roomName);
    this.connectedRooms.set(data.userId, userRooms);
    this.usersService.updateUserStatus(data.userId, UserStatus.PLAYING);
    this.server.emit('userStatus', { userId: data.userId, status: 'PLAYING' });
    this.server.to(roomName).emit('joinGame', { gameId: data.gameId, userId: data.userId });
  }

  @SubscribeMessage('leaveGame')
  onLeaveGame(client: Socket, data: { gameId: string, userId: string }) {
    const roomName = `${data.gameId}`;
    const userRooms = this.connectedRooms.get(data.userId) || new Set<string>();

    if (!userRooms.has(roomName)) {
      return;
    }

    client.leave(roomName);
    this.logger.log(`Client ${data.userId} left game ${data.gameId}`);

    userRooms.delete(roomName);
    this.connectedRooms.set(data.userId, userRooms);

    if (userRooms.size === 0) {
      this.connectedRooms.delete(data.userId);
    }

    this.leaveSocketGame(data.gameId, data.userId);
    this.usersService.updateUserStatus(data.userId, UserStatus.ONLINE);
    this.server.emit('userStatus', { userId: data.userId, status: 'ONLINE' });
  }

  @SubscribeMessage('movePlayer')
  onMovePlayer(client: Socket, data: { gameId: string, userId: string, position: any }) {
    const roomName = `${data.gameId}`;
    // emit in room
    this.server.to(roomName).emit('movePlayer', { gameId: data.gameId, userId: data.userId, position: data.position });
  }

  @SubscribeMessage('movePlayerTwo')
  onMovePlayerTwo(client: Socket, data: { gameId: string, userId: string, position: any }) {
    const roomName = `${data.gameId}`;
    // emit in room
    this.server.to(roomName).emit('movePlayerTwo', { gameId: data.gameId, userId: data.userId, position: data.position });
  }

  @SubscribeMessage('moveBall')
  onMoveBall(client: Socket, data: { gameId: string, x: number, y: number}) {
    const roomName = `${data.gameId}`;
    // emit in room
    this.server.to(roomName).emit('moveBall', { gameId: data.gameId, x: data.x, y: data.y });
  }

  @SubscribeMessage('updateScore')
  onUpdateScore(client: Socket, data: { gameId: string, score: any }) {
    const roomName = `${data.gameId}`;
    // emit in room
    this.server.to(roomName).emit('updateScore', { gameId: data.gameId, score: data.score });
  }

  /*
  * Emit action : CHAT
  */

  async getChatIdFromSocket(socket: Socket): Promise<string | null> {
    const roomName = await socket.rooms.values().next().value;
    if (roomName) {
      return roomName;
    } else {
      return null;
    }
  }

  // Get socket by chat
  async getSocketIdByChatId(chatId: string): Promise<string | null> {
    const roomName = `${chatId}`;
    const room = await this.server.sockets.adapter.rooms.get(roomName);
    if (room) {
      const socketId = room.values().next().value;
      return socketId;
    } else {
      return null;
    }
  }


  // new chat
  createSocketRoom(chatId: string) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('newChat', { chatId });
  }

  // delete chat
  deleteSocketRoom(chatId: string) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('deleteChat', { chatId });
  }

  // join chat
  joinSocketRoom(chatId: string, userId: string) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('joinChat', { chatId, userId });
  }

  // leave chat
  leaveSocketRoom(chatId: string, userId: string) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('leaveChat', { chatId, userId });
  }

  // new message
  newMessage(chatId: string, message: any) {
    const roomName = `${chatId}`;
    // emit in room
    this.server.to(roomName).emit('newMessage', message);
  }



  /*
  * Handle action
  */

  @SubscribeMessage('createChannel')
  onCreateChannel(@Body() data: { updatedAt: string }) {
    // emit to all online users
    this.server.emit('createChannel', { updatedAt: data.updatedAt });
  }

  @SubscribeMessage('updateChannelMembersList')
  onUpdateChannelMembersList(@Body() data: { updatedAt: string, channelId: string }) {
    const roomName = `${data.channelId}`;
    // emit to all online users
    this.server.to(roomName).emit('updateChannelMembersList', { updatedAt: data.updatedAt, channelId: data.channelId });
  }

  @SubscribeMessage('joinChat')
  onJoinChat(client: Socket, data: { chatId: string, userId: string }) {
    const roomName = `${data.chatId}`;
    const userRooms = this.connectedRooms.get(data.userId) || new Set<string>();

    if (userRooms.has(roomName)) {
      return;
    }

    client.join(roomName);
    this.logger.log(`Client ${data.userId} joined chat ${data.chatId}`);

    userRooms.add(roomName);
    this.connectedRooms.set(data.userId, userRooms);
  }

  @SubscribeMessage('leaveChat')
  onLeaveChat(client: Socket, data: { chatId: string, userId: string }) {
    const roomName = `${data.chatId}`;
    const userRooms = this.connectedRooms.get(data.userId) || new Set<string>();

    if (!userRooms.has(roomName)) {
      return;
    }

    client.leave(roomName);
    this.logger.log(`Client ${data.userId} left chat ${data.chatId}`);

    userRooms.delete(roomName);
    this.connectedRooms.set(data.userId, userRooms);
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() message: any) {
    if (message.chatId) {
      // emit to room
      this.newMessage(message.chatId, message);
    }
  }


  @SubscribeMessage('newChat')
  onNewChat(client: Socket, chatId: string) {
    this.logger.log(`Client ${client.id} created chat ${chatId}`);
    this.createSocketRoom(chatId);
  }

  @SubscribeMessage('deleteChat')
  onDeleteChat(client: Socket, chatId: string) {
    this.logger.log(`Client ${client.id} deleted chat ${chatId}`);
    this.deleteSocketRoom(chatId);
  }

  @SubscribeMessage('ban')
  onBan(client: Socket, data: { chatId: string, userId: string }) {
    const roomName = `${data.chatId}`;
    this.server.to(roomName).emit('ban', { chatId: data.chatId, userId: data.userId });
  }
  
  @SubscribeMessage('kick')
  onKick(client: Socket, data: { chatId: string, userId: string }) {
    const roomName = `${data.chatId}`;
    this.server.to(roomName).emit('kick', { chatId: data.chatId, userId: data.userId });
  }

}
