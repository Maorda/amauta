// consulta-generica-ia.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsObject, IsArray, Max, Min, IsString } from 'class-validator';

export class ConsultaGenericaIaDto {
    @IsOptional()
    @IsObject({ message: 'El campo "where" debe ser un objeto de filtros válido.' })
    where?: Record<string, any>;

    @IsOptional()
    @IsArray({ message: 'El campo "orderBy" debe ser una lista de criterios de ordenamiento.' })
    orderBy?: Record<string, 'asc' | 'desc'>[];

    // 📋 SELECTOR DE CAMPOS (Clave para ahorrar ancho de banda)
    // Permite a n8n especificar un objeto con los campos que realmente necesita.
    // Ejemplo: { codigoRemate: true, precioBaseDolares: true }
    @IsOptional()
    @IsObject({ message: 'El campo "select" debe ser un objeto de proyección válido.' })
    select?: Record<string, boolean>;

    // 🔢 PAGINACIÓN TRADICIONAL
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    // ⏩ PAGINACIÓN POR CURSOR (Alternativa ultrarrápida para bucles en n8n)
    // n8n puede enviar el ID del último registro procesado para traer los siguientes de inmediato.
    @IsOptional()
    @IsString()
    cursor?: string;
}
