// src/remates/remates.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Remate, RemateDocument } from './schemas/remate.schema.js';
import { IngestaMasterDto } from './dto/master-ingesta.dto.js';
import { ConsultaGenericaIaDto } from './dto/consulta-generica-ia.dto.js';

@Injectable()
export class RematesService {
    private readonly logger = new Logger(RematesService.name);

    constructor(
        @InjectModel(Remate.name) private readonly remateModel: Model<RemateDocument>,
    ) { }

    /**
     * FASE 1: Ingesta Masiva NoSQL nativa (Upsert)
     * Sincronizada con el esquema de sub-documentos anidados
     */
    async procesarIngestaMaster(dto: IngestaMasterDto) {
        try {
            this.logger.log(`[Mongoose] Iniciando ingesta para remate: ${dto.codigoRemate}`);

            // 💡 ADAPTACIÓN CRÍTICA: Mapeamos los campos del DTO a la estructura real de tu esquema NoSQL
            const dataAGuardar = {
                codigoRemate: dto.codigoRemate,
                convocatoria: dto.convocatoria,
                tasacionDolares: dto.tasacionDolares,
                precioBaseDolares: dto.precioBaseDolares,
                oblajeDolares: dto.oblajeDolares,
                tipoCambioSbs: dto.tipoCambioSbs,
                arancelSoles: dto.arancelSoles,
                expediente: dto.expediente, // Objeto estructurado anidado
                inmuebles: dto.inmuebles,   // Array de inmuebles
                cronograma: dto.cronograma || [],
                metadataScraping: dto.metadataScraping || {},
            };

            const nuevoRemate = await this.remateModel.findOneAndUpdate(
                { codigoRemate: dto.codigoRemate },
                dataAGuardar,
                { upsert: true, new: true, runValidators: true },
            );

            this.logger.log(`[Mongoose] Remate ${dto.codigoRemate} guardado/actualizado con éxito.`);

            return {
                success: true,
                message: 'Master JSON procesado correctamente en MongoDB Atlas vía Mongoose.',
                id: nuevoRemate._id,
            };
        } catch (error: any) {
            this.logger.error(`Error en ingesta Mongoose: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Error interno al guardar el Master JSON en la base de datos.');
        }
    }

    /**
     * FASE 2: Consulta Genérica Estructurada para n8n / IA
     * Soporta búsquedas por sub-documentos usando notación de puntos de forma nativa
     */
    async consultaGenericaParaIa(filtroDto: ConsultaGenericaIaDto) {
        try {
            const { where, orderBy, page = 1, limit = 20, select } = filtroDto;
            const skip = (page - 1) * limit;

            // 1. Mapear filtros 'where' (MongoDB y Mongoose resuelven paths anidados automáticamente)
            const query = this.remateModel.find(where || {});

            // 2. Aplicar Proyección Dinámica (Select) para ahorrar ancho de banda en Render
            if (select && Object.keys(select).length > 0) {
                query.select(select);
            }

            // 3. Aplicar Ordenamiento Dinámico
            if (orderBy && orderBy.length > 0) {
                const sortObj: any = {};
                orderBy.forEach((order) => {
                    Object.keys(order).forEach((key) => {
                        sortObj[key] = order[key] === 'asc' ? 1 : -1;
                    });
                });
                query.sort(sortObj);
            }

            // 4. Paginación y Ejecución eficiente en paralelo
            query.skip(skip).limit(limit);

            const [total, datos] = await Promise.all([
                this.remateModel.countDocuments(where || {}),
                query.exec(),
            ]);

            return {
                meta: {
                    totalRegistros: total,
                    limitePorPagina: limit,
                    paginaActual: page,
                    totalPaginas: Math.ceil(total / limit),
                },
                resultados: datos,
            };
        } catch (error: any) {
            this.logger.error(`Error en consulta Mongoose: ${error.message}`);
            throw new InternalServerErrorException('Error al procesar la consulta genérica en MongoDB.');
        }
    }
}
