// src/remates/schemas/remate.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
class ParteProcesal {
    @Prop({ required: true })
    rol!: string; // DEMANDANTE, DEMANDADO, TERCERO (PERITO)

    @Prop({ required: true })
    tipoPersona!: string; // NATURAL, JURIDICA

    @Prop()
    apellidoPaternoRazonSocial?: string;

    @Prop()
    apellidoMaterno?: string;

    @Prop({ required: true })
    nombres!: string;
}

@Schema({ _id: false })
class SeguimientoExpediente {
    @Prop()
    fecha?: string;

    @Prop()
    acto?: string;

    @Prop()
    resolucion?: string;

    @Prop()
    fojas?: number;

    @Prop()
    sumilla?: string;

    @Prop()
    archivoUrl?: string;
}

@Schema({ _id: false })
class ExpedienteJudicial {
    @Prop({ required: true, index: true })
    numeroExpediente!: string;

    @Prop()
    organoJurisdiccional?: string;

    @Prop()
    distritoJudicial?: string;

    @Prop()
    juez?: string;

    @Prop()
    especialistaLegal?: string;

    @Prop()
    materia?: string;

    @Prop()
    estado?: string;

    @Prop({ type: [ParteProcesal], default: [] })
    partes!: ParteProcesal[];

    @Prop({ type: [SeguimientoExpediente], default: [] })
    historialSeguimiento!: SeguimientoExpediente[];
}

@Schema({ _id: false })
class HitoCronograma {
    @Prop({ required: true })
    fase!: string;

    @Prop({ required: true, type: Date })
    fechaInicio!: Date;

    @Prop({ required: true, type: Date })
    fechaFin!: Date;
}

@Schema({ _id: false })
class InmuebleSunarp {
    @Prop({ required: true, index: true })
    partidaRegistral!: string;

    @Prop()
    tipoInmueble?: string;

    @Prop({ required: true })
    direccion!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    cargasYGravamenes!: any[];

    @Prop()
    porcentajeARematar?: string;
}

export type RemateDocument = HydratedDocument<Remate>;

@Schema({ timestamps: true, collection: 'remates' })
export class Remate {
    @Prop({ required: true, unique: true, index: true })
    codigoRemate!: string;

    @Prop()
    convocatoria?: string;

    @Prop({ type: Number })
    tasacionDolares?: number;

    @Prop({ type: Number })
    precioBaseDolares?: number;

    @Prop({ type: Number })
    oblajeDolares?: number;

    @Prop({ type: Number })
    tipoCambioSbs?: number;

    @Prop({ type: Number })
    arancelSoles?: number;

    @Prop({ type: ExpedienteJudicial, required: true })
    expediente!: ExpedienteJudicial;

    @Prop({ type: [InmuebleSunarp], required: true })
    inmuebles!: InmuebleSunarp[];

    @Prop({ type: [HitoCronograma], default: [] })
    cronograma!: HitoCronograma[];

    @Prop({ type: MongooseSchema.Types.Mixed })
    metadataScraping?: any;
}

export const RemateSchema = SchemaFactory.createForClass(Remate);
