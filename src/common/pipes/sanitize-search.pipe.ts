// src/common/pipes/sanitize-search.pipe.ts
import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class SanitizeSearchPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // 💡 Si no hay valor o no es un objeto/string, lo dejamos pasar
        if (!value) return value;

        // Si es una petición de consulta estructurada (Body de la IA), sanitizamos quirúrgicamente
        if (typeof value === 'object') {
            if (value.where) {
                this.sanitizeObject(value.where);
            }
            return value;
        }

        // Si es un string directo (búsqueda simple)
        if (typeof value === 'string') {
            return this.cleanString(value);
        }

        return value;
    }

    private sanitizeObject(obj: any) {
        if (typeof obj !== 'object' || obj === null) return;

        for (const key of Object.keys(obj)) {
            // Evitar inyecciones en los nombres de las llaves
            if (/[$\.]/.test(key) && !key.startsWith('$')) {
                throw new BadRequestException('El término de búsqueda contiene caracteres no válidos o está vacío.');
            }

            if (typeof obj[key] === 'string') {
                obj[key] = this.cleanString(obj[key]);
            } else if (typeof obj[key] === 'object') {
                this.sanitizeObject(obj[key]);
            }
        }
    }

    private cleanString(str: string): string {
        // Permitir letras, números, espacios, guiones y caracteres del español (tildes, eñes)
        // Conservamos los operadores de regex seguros
        const cleaned = str.replace(/[^\w\s\dáéíóúÁÉÍÓÚñÑ.,:\-\/|]/g, '').trim();
        return cleaned;
    }
}
