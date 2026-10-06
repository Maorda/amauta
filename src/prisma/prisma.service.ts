// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // Corregido: Uso del cliente estándar para MongoDB

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        // Configuramos Prisma para que imprima logs de errores y advertencias
        super({
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Conexión establecida exitosamente con MongoDB Atlas a través de Prisma.');
        } catch (error) {
            this.logger.error('❌ Error al conectar con MongoDB Atlas:', error.stack);
            throw error; // Relanzar el error evita que NestJS arranque sin base de datos
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('🔌 Conexión con MongoDB Atlas cerrada correctamente.');
    }
}