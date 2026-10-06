// api-key.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly logger = new Logger(ApiKeyGuard.name);

    constructor(private readonly configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        // Extraemos la llave desde la cabecera personalizada
        const apiKeyCliente = request.headers['x-api-key'];
        const apiKeyServidor = this.configService.get<string>('API_KEY_SCRAPER');

        if (!apiKeyCliente) {
            this.logger.warn(`Intento de acceso denegado: Petición sin API Key desde la IP: ${request.ip}`);
            throw new UnauthorizedException('Acceso denegado. No se proporcionó la cabecera x-api-key.');
        }

        if (apiKeyCliente !== apiKeyServidor) {
            this.logger.error(`Intento de vulneración detectado: API Key inválida desde la IP: ${request.ip}`);
            throw new UnauthorizedException('Acceso denegado. La API Key proporcionada es inválida.');
        }

        return true;
    }
}
