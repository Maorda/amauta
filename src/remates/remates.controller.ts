// remates.controller.ts
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Get
} from '@nestjs/common';
import { RematesService } from './remates.service';
import { IngestaMasterDto } from './dto/master-ingesta.dto';
import { ConsultaGenericaIaDto } from './dto/consulta-generica-ia.dto';
import { } from '../common/pipes/sanitize-search.pipe';
import { SanitizeSearchPipe } from '../common/pipes/sanitize-search.pipe';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('remates')
export class RematesController {
    constructor(private readonly rematesService: RematesService) { }

    /**
     * Endpoint consumido por los escarbadores webs complejos.
     * Recibe el Master JSON masivo y lo guarda de manera atómica en MongoDB.
     */
    @Post('ingesta')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(ApiKeyGuard) // 3. Aplicar protección de API Key aquí
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async registrarIngestaMasiva(@Body() ingestaDto: IngestaMasterDto) {
        return await this.rematesService.procesarIngestaMaster(ingestaDto);
    }

    /**
     * Endpoint genérico consumido por la Inteligencia Artificial.
     * Recibe criterios complejos traducidos de lenguaje natural a filtros NoSQL.
     */
    @Post('consulta')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }), new SanitizeSearchPipe())
    async ejecutarConsultaIa(@Body() consultaDto: ConsultaGenericaIaDto) {
        return await this.rematesService.consultaGenericaParaIa(consultaDto);
    }

    @Get('health')
    @HttpCode(HttpStatus.OK)
    async checkHealth() {
        return { status: 'up', timestamp: new Date().toISOString() };
    }
}
