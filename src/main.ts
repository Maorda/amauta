import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IaExceptionFilter } from './common/filters/ia-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new IaExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
