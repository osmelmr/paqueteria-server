import 'dotenv/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.use(helmet()); // ✅ Quita los paréntesis aquí
  app.enableCors({
    origin: CORS_ORIGINS.length > 0 ? CORS_ORIGINS : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
  console.log(
    `Server is running on http://0.0.0.0:${process.env.PORT ?? 5000}`,
  );
}
bootstrap();
