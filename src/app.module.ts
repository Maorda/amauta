import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { RematesModule } from './remates/remates.module';

@Module({
  imports: [
    // Carga las variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),
    // Conexión asíncrona a MongoDB Atlas usando ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    PrismaModule,
    RematesModule,
  ],
})
export class AppModule { }
