// master-ingesta.dto.ts
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';

export class JsonRemajuDto {
    @IsArray()
    @IsString({ each: true })
    demandados: string[];

    @IsArray()
    @IsString({ each: true })
    demandantes: string[];

    @IsString()
    @IsNotEmpty()
    direccion: string;

    @IsBoolean()
    cartel: boolean;
}

export class JsonSunarpDto {
    @IsArray()
    detallesVarios: Record<string, any>[]; // Recibe la estructura de gravámenes variables
}

export class InmuebleDto {
    @IsString()
    @IsNotEmpty()
    partidaRegistral: string;

    @IsString()
    tipoInmueble: string;

    @IsString()
    direccion: string;

    @IsString()
    porcentajeARematar: string;
}

export class IngestaMasterDto {
    @IsString()
    @IsNotEmpty()
    codigoRemate: string;

    @IsString()
    convocatoria: string;

    @IsNumber()
    tasacionDolares: number;

    @IsNumber()
    precioBaseDolares: number;

    // Integración de los JSON específicos definidos en tu modelo de negocio
    @ValidateNested()
    @Type(() => JsonRemajuDto)
    json_remaju: JsonRemajuDto;

    @ValidateNested()
    @Type(() => JsonSunarpDto)
    json_sunarp: JsonSunarpDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InmuebleDto)
    inmuebles: InmuebleDto[];

    @IsOptional()
    cronograma: any[];

    @IsOptional()
    expedienteDatosPoderJudicial: any;
}
