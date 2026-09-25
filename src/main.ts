import 'dotenv/config';
import cookieParser from 'cookie-parser';
import helmetImport from 'helmet';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Workaround: los tipos de helmet no son compatibles con moduleResolution NodeNext/Node16.
// En runtime sí es una función invocable, así que forzamos el tipo.
const helmet = helmetImport as unknown as (
  options?: Record<string, unknown>,
) => (req: unknown, res: unknown, next: unknown) => void;

const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('json', { limit: '10mb' });
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: CORS_ORIGINS.length > 0 ? CORS_ORIGINS : true,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // ============================================================
  const config = new DocumentBuilder()
    .setTitle('Mi API')
    .setDescription('Documentación de mi API')
    .setVersion('1.0')
    .addBearerAuth() // Opcional: si usas JWT
    .addCookieAuth('access_token') // Opcional: si usas cookies para auth
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  // ============================================================
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
  console.log(
    `Server is running on http://0.0.0.0:${process.env.PORT ?? 5000}`,
  );
  console.log(
    `Swagger docs available at http://0.0.0.0:${process.env.PORT ?? 5000}/api/docs`,
  ); // ✅ opcional: log de la URL de docs
}
bootstrap();
