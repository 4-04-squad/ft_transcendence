import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

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

  await app.listen(3001);
}

bootstrap();
