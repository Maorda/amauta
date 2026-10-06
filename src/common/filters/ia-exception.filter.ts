// ia-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class IaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('IaExceptionFilter');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Determinamos el código de estado HTTP
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        // Extraemos el mensaje de error de NestJS
        const messageResponse = exception instanceof HttpException
            ? exception.getResponse()
            : 'Error interno no controlado en el servidor.';

        const errorMsg = typeof messageResponse === 'object' && messageResponse['message']
            ? messageResponse['message']
            : exception.message || messageResponse;

        // Logueamos internamente para el equipo de desarrollo humano
        this.logger.error(`[Error ${status}] enviado a la IA. Detalles: ${JSON.stringify(errorMsg)}`);

        // Estructura semántica diseñada específicamente para que un LLM (IA) la entienda
        const payloadParaIa = {
            sistema: {
                error: true,
                statusCode: status,
                timestamp: new Date().toISOString(),
            },
            instruccion_para_ia: {
                diagnostico_breve: "La petición enviada a la API de NestJS no pudo completarse debido a un error de validación o base de datos.",
                causa_del_fallo: errorMsg,
                accion_sugerida_para_el_llm: this.obtenerSugerenciaIa(status, errorMsg)
            }
        };

        response.status(status).json(payloadParaIa);
    }

    /**
     * Genera instrucciones en lenguaje natural dentro del JSON de error 
     * para guiar al modelo de Inteligencia Artificial sobre cómo corregir su comportamiento.
     */
    private obtenerSugerenciaIa(status: number, errorMsg: any): string {
        if (status === 400) {
            return "Revisa los tipos de datos del JSON que construiste en la sección 'where' u 'orderBy'. Asegúrate de no enviar caracteres extraños prohibidos por el Pipe de sanitización y vuelve a intentar estructurar la consulta.";
        }
        if (status === 404) {
            return "El recurso o endpoint solicitado no existe. Informa al usuario humano que los registros solicitados bajo esos identificadores no han sido indexados.";
        }
        return "Error de infraestructura. Notifica amablemente al usuario que hay intermitencias con MongoDB Atlas y que intente su consulta en unos minutos.";
    }
}
