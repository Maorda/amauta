// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { IaExceptionFilter } from './common/filters/ia-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Filtro de errores semánticos globales adaptados para la IA
  app.useGlobalFilters(new IaExceptionFilter());

  // 2. Único Pipe Global: Validación estructural estricta de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  logger.log(`🚀 Aplicación judicial ("Amauta") corriendo exitosamente en el puerto: ${port}`);
}
bootstrap();
