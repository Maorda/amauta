// src/remates/remates.module.ts
import { Module } from '@nestjs/common';
import { RematesController } from './remates.controller';
import { RematesService } from './remates.service';
// Al no importar PrismaService aquí directamente, confiamos en que PrismaModule 
// está registrado como @Global() en tu app.module.ts, haciendo el cliente de MongoDB accesible.

@Module({
    controllers: [RematesController],
    providers: [RematesService],
    // Si decidieras quitar el decorador @Global() de tu PrismaModule, 
    // deberás descomentar la siguiente línea para importar la conexión de MongoDB:
    // imports: [PrismaModule],
})
export class RematesModule { }
