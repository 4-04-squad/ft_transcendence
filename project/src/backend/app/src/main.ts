import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { SocketsGateway } from './socket/socket.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Load .env
  dotenv.config();

  // Set the base path for the app
  app.setGlobalPrefix('api');

  app.use(cookieParser());

  // Swagger
  if (process.env.ENVIRONMENT === "development") {
    const config = new DocumentBuilder()
      .setTitle('42Pong')
      .setDescription('4:04 Squad - ft_transcendence')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.enableCors({
    origin: process.env.WEB_URL,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Cookie',
    methods: 'GET,PUT,POST,DELETE',
  });

  const logger = new Logger('Bootstrap');

  // Create an HTTP server instance
  const server = createServer(app.getHttpServer());

  // Create a Socket.IO server instance and attach it to the HTTP server
  const io = new Server(server, {
    cors: {
      origin: process.env.WEB_URL,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      credentials: true,
    },
    path: '/ws', // This should match the path you've configured in your Nginx proxy
  });

  const socketsGateway = app.get(SocketsGateway);
  socketsGateway.init(io);

  io.on('connection', (socket) => {
    logger.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      logger.log(`Client disconnected: ${socket.id}`);
    });
  });

  await app.listen(3001);
}

bootstrap();
