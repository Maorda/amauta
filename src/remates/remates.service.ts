import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; // 💡 Importar namespace de Prisma
import { IngestaMasterDto } from './dto/master-ingesta.dto';
import { ConsultaGenericaIaDto } from './dto/consulta-generica-ia.dto';

@Injectable()
export class RematesService {
    private readonly logger = new Logger(RematesService.name);

    constructor(private readonly prisma: PrismaService) { }

    async procesarIngestaMaster(dto: IngestaMasterDto) {
        try {
            this.logger.log(`Iniciando ingesta para el remate código: ${dto.codigoRemate}`);

            const nuevoRemate = await this.prisma.remate.upsert({
                where: { codigoRemate: dto.codigoRemate },
                update: {
                    convocatoria: dto.convocatoria,
                    tasacionDolares: dto.tasacionDolares,
                    precioBaseDolares: dto.precioBaseDolares,
                    // 💡 SOLUCIÓN: Casteo seguro usando (dto.campo as unknown as Prisma.InputJsonValue)
                    jsonRemaju: dto.json_remaju as unknown as Prisma.InputJsonValue,
                    jsonSunarp: dto.json_sunarp as unknown as Prisma.InputJsonValue,
                    inmuebles: dto.inmuebles as unknown as Prisma.InputJsonValue,
                    cronograma: dto.cronograma
                        ? (dto.cronograma as unknown as Prisma.InputJsonValue)
                        : undefined,
                    expedienteDatosPoderJudicial: dto.expedienteDatosPoderJudicial
                        ? (dto.expedienteDatosPoderJudicial as unknown as Prisma.InputJsonValue)
                        : undefined,
                },
                create: {
                    codigoRemate: dto.codigoRemate,
                    convocatoria: dto.convocatoria,
                    tasacionDolares: dto.tasacionDolares,
                    precioBaseDolares: dto.precioBaseDolares,
                    // 💡 SOLUCIÓN: Mismo casteo doble para la etapa de creación
                    jsonRemaju: dto.json_remaju as unknown as Prisma.InputJsonValue,
                    jsonSunarp: dto.json_sunarp as unknown as Prisma.InputJsonValue,
                    inmuebles: dto.inmuebles as unknown as Prisma.InputJsonValue,
                    cronograma: dto.cronograma
                        ? (dto.cronograma as unknown as Prisma.InputJsonValue)
                        : ([] as unknown as Prisma.InputJsonValue),
                    expedienteDatosPoderJudicial: dto.expedienteDatosPoderJudicial
                        ? (dto.expedienteDatosPoderJudicial as unknown as Prisma.InputJsonValue)
                        : ({} as unknown as Prisma.InputJsonValue),
                },
            });

            this.logger.log(`Remate ${dto.codigoRemate} guardado/actualizado exitosamente.`);
            return {
                success: true,
                id: nuevoRemate.id,
                message: 'Master JSON procesado correctamente en MongoDB Atlas.',
            };

        } catch (error) {
            this.logger.error(`Error procesando la ingesta del remate ${dto.codigoRemate}:`, error.stack);
            throw new InternalServerErrorException('Error interno al guardar el Master JSON en la base de datos.');
        }
    }

    async consultaGenericaParaIa(filtroDto: ConsultaGenericaIaDto) {
        // 💡 Asignación de valores por defecto para evitar NaN o Infinity
        const { where, orderBy, page = 1, limit = 10, select, cursor } = filtroDto;
        const paginaSegura = Math.max(1, page);

        // 💡 Uso de tipado estricto de Prisma
        const queryOptions: Prisma.RemateFindManyArgs = {
            where,
            orderBy: orderBy || [{ createdAt: 'desc' }],
            take: limit,
        };

        if (select && Object.keys(select).length > 0) {
            queryOptions.select = select as Prisma.RemateSelect;
        }

        if (cursor) {
            queryOptions.skip = 1;
            queryOptions.cursor = { id: cursor };
        } else {
            queryOptions.skip = (paginaSegura - 1) * limit;
        }

        let total = 0;
        let datos: any[] = [];

        // 💡 Optimización: Solo contamos si NO usamos cursor
        if (cursor) {
            datos = await this.prisma.remate.findMany(queryOptions);
        } else {
            [total, datos] = await this.prisma.$transaction([
                this.prisma.remate.count({ where }),
                this.prisma.remate.findMany(queryOptions),
            ]);
        }

        const ultimoElemento = datos[datos.length - 1];
        const siguienteCursor = ultimoElemento ? ultimoElemento.id : null;

        return {
            meta: {
                limitePorPagina: limit,
                ...(cursor
                    ? { siguienteCursor }
                    : {
                        totalRegistros: total,
                        paginaActual: paginaSegura,
                        totalPaginas: Math.ceil(total / limit)
                    }
                )
            },
            resultados: datos,
        };
    }

    async busquedaTextoAvanzadaParaIa(terminoBusqueda: string, limite: number = 10) {
        try {
            const resultadoRaw = await this.prisma.$runCommandRaw({
                aggregate: 'remates',
                pipeline: [
                    {
                        $search: { index: 'default', text: { query: terminoBusqueda, path: ['jsonRemaju.demandados', 'jsonSunarp.detallesVarios.gravamen', 'jsonSunarp.detallesVarios.otros'], fuzzy: { maxEdits: 2 } } }
                    }, { $limit: limite },
                    {
                        $project: {
                            _id: 1,
                            codigoRemate: 1,
                            precioBaseDolares: 1,
                            jsonRemaju: 1,
                            jsonSunarp: 1,
                            score: { $meta: 'searchScore' }
                        }
                    }
                ],
                cursor: {}
            });

            // 💡 Optional chaining seguro
            const documentos = (resultadoRaw as any)?.cursor?.firstBatch ?? [];

            return {
                totalResultados: documentos.length,
                terminoBuscado: terminoBusqueda,
                resultados: documentos,
            };

        } catch (error) {
            this.logger.error('Error en la búsqueda avanzada de Atlas Search', error instanceof Error ? error.stack : error);
            throw new InternalServerErrorException('Error al procesar la búsqueda avanzada de texto en la base de datos.');
        }
    }
}