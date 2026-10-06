// env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    // Entorno de ejecución
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    PORT: Joi.number().default(3000),

    // Conexión obligatoria a MongoDB Atlas para Prisma
    DATABASE_URL: Joi.string()
        .required()
        .pattern(/^mongodb(\+srv)?:\/\//)
        .message('DATABASE_URL debe ser una cadena válida de MongoDB Atlas (mongodb+srv://)'),

    // Configuración de Seguridad para producción
    API_KEY_SCRAPER: Joi.string()
        .required()
        .min(32)
        .message('API_KEY_SCRAPER es requerida en producción para asegurar el endpoint de ingesta (mínimo 32 caracteres).'),
});
