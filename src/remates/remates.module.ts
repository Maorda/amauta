// src/remates/remates.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RematesController } from './remates.controller';
import { RematesService } from './remates.service';
import { Remate, RemateSchema } from './schemas/remate.schema';

@Module({
    imports: [
        // 💡 INYECCIÓN CRÍTICA: Registramos el esquema de Mongoose dentro del contexto del módulo.
        // Esto habilita la inyección del modelo mediante @InjectModel en el RematesService.
        MongooseModule.forFeature([
            {
                name: Remate.name,
                schema: RemateSchema
            }
        ]),
    ],
    controllers: [RematesController],
    providers: [RematesService],
    // Exportamos el servicio por si en el futuro otro módulo (ej. un módulo de IA dedicado) 
    // requiere interactuar directamente con la lógica de negocio de los remates judiciales.
    exports: [RematesService],
})
export class RematesModule { }
