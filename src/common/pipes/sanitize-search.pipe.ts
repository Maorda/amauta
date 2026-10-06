// sanitize-search.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SanitizeSearchPipe implements PipeTransform {
    transform(value: any) {
        if (typeof value === 'string') {
            return this.sanitizeString(value);
        }

        if (typeof value === 'object' && value !== null) {
            return this.sanitizeObject(value);
        }

        return value;
    }

    private sanitizeString(str: string): string {
        // 1. Eliminamos espacios en blanco redundantes
        let clean = str.trim().replace(/\s+/g, ' ');

        // 2. Removemos caracteres sospechosos que puedan romper Atlas Search o inyectar scripts
        // Permitimos letras (incluyendo eñes y tildes), números, espacios, guiones y comillas simples/dobles normales
        clean = clean.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s'\-\"\.\,]/g, '');

        // 3. Validamos que el string resultante no esté vacío después de la limpieza
        if (!clean) {
            throw new BadRequestException('El término de búsqueda contiene caracteres no válidos o está vacío.');
        }

        return clean;
    }

    private sanitizeObject(obj: any): any {
        const sanitizedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                // Sanitizamos recursivamente si el objeto de la IA viene anidado (como el DTO 'where')
                sanitizedObj[key] = typeof obj[key] === 'object'
                    ? this.sanitizeObject(obj[key])
                    : typeof obj[key] === 'string' ? this.sanitizeString(obj[key]) : obj[key];
            }
        }
        return sanitizedObj;
    }
}
