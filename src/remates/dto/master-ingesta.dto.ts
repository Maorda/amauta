// src/remates/dto/master-ingesta.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class ParteProcesalDto {
    @IsString() @IsNotEmpty() rol!: string;
    @IsString() @IsNotEmpty() tipoPersona!: string;
    @IsOptional() @IsString() apellidoPaternoRazonSocial?: string;
    @IsOptional() @IsString() apellidoMaterno?: string;
    @IsString() @IsNotEmpty() nombres!: string;
}

class ExpedienteJudicialDto {
    @IsString() @IsNotEmpty() numeroExpediente!: string;
    @IsOptional() @IsString() organoJurisdiccional?: string;
    @IsOptional() @IsString() distritoJudicial?: string;
    @IsOptional() @IsString() juez?: string;
    @IsOptional() @IsString() especialistaLegal?: string;
    @IsOptional() @IsString() materia?: string;
    @IsOptional() @IsString() estado?: string;

    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ParteProcesalDto)
    partes?: ParteProcesalDto[];

    @IsOptional() @IsArray()
    historialSeguimiento?: any[];
}

class InmuebleSunarpDto {
    @IsString() @IsNotEmpty() partidaRegistral!: string;
    @IsOptional() @IsString() tipoInmueble?: string;
    @IsString() @IsNotEmpty() direccion!: string;
    @IsOptional() @IsArray() cargasYGravamenes?: any[];
    @IsOptional() @IsString() porcentajeARematar?: string;
}

export class IngestaMasterDto {
    @IsString() @IsNotEmpty() codigoRemate!: string;
    @IsOptional() @IsString() convocatoria?: string;
    @IsOptional() @IsNumber() tasacionDolares?: number;
    @IsOptional() @IsNumber() precioBaseDolares?: number;
    @IsOptional() @IsNumber() oblajeDolares?: number;
    @IsOptional() @IsNumber() tipoCambioSbs?: number;
    @IsOptional() @IsNumber() arancelSoles?: number;

    @ValidateNested() @Type(() => ExpedienteJudicialDto)
    expediente!: ExpedienteJudicialDto;

    @IsArray() @ValidateNested({ each: true }) @Type(() => InmuebleSunarpDto)
    inmuebles!: InmuebleSunarpDto[];

    @IsOptional() @IsArray()
    cronograma?: any[];

    @IsOptional()
    metadataScraping?: any;
}
