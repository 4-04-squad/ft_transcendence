import { WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  },
})
export class SocketsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private logger: Logger = new Logger('SocketGateway');

  private connectedRooms = new Map<string, Set<string>>();
  private connectedClients = new Set<string>();

  @WebSocketServer()
  private server: Server;

  // Define the init method as required by the OnGatewayInit interface
  public init(server: Server) {
    this.server = server;
  }

  afterInit(server: any) {
    this.logger.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    if (!this.connectedClients.has(client.id)) {
      this.connectedClients.add(client.id);
      this.logger.log(`Client connected: ${client.id}`);
    }
  }
  
  async handleDisconnect(socket: Socket) {
    if (this.connectedClients.has(socket.id)) {
      this.connectedClients.delete(socket.id);
      this.logger.log(`Client disconnected: ${socket.id}`);
    }
  }

  
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
  async createSocketRoom(chatId: string) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('newChat', { chatId });
  }

  // delete chat
  async deleteSocketRoom(chatId: string) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('deleteChat', { chatId });
  }

  // join chat
  async joinSocketRoom(chatId: string, userId: string) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('joinChat', { chatId, userId });
  }

  // leave chat
  async leaveSocketRoom(chatId: string, userId: string) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('leaveChat', { chatId, userId });
  }

  // new message
  async newMessage(chatId: string, message: any) {
    const roomName = `${chatId}`;
    this.server.to(roomName).emit('newMessage', message);
  }



  /*
  * Handle action
  */

  @SubscribeMessage('joinChat')
  async onJoinChat(client: Socket, data: { chatId: string, userId: string }) {
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
  async onLeaveChat(client: Socket, data: { chatId: string, userId: string }) {
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
  async onNewMessage(client: Socket, message: any) {
    const chatId = await this.getChatIdFromSocket(client);
    if (chatId) {
      this.logger.log(`Client ${client.id} sent message to chat ${chatId}`);
      this.newMessage(chatId, message);
    }
  }

  @SubscribeMessage('newChat')
  async onNewChat(client: Socket, chatId: string) {
    this.logger.log(`Client ${client.id} created chat ${chatId}`);
    this.createSocketRoom(chatId);
  }

  @SubscribeMessage('deleteChat')
  async onDeleteChat(client: Socket, chatId: string) {
    this.logger.log(`Client ${client.id} deleted chat ${chatId}`);
    this.deleteSocketRoom(chatId);
  }
}
