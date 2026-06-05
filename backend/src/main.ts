import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          
      forbidNonWhitelisted: true,
      transform: true,          
<<<<<<< HEAD
      stopAtFirstError: false,  
=======
      stopAtFirstError: false, 
>>>>>>> 84b8b16469119f7885cf1c10a75f9a93fc448f3d
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Store Ratings API running on port ${port}`);
}

bootstrap();
