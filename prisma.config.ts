import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({

    // Ruta hacia tu esquema de MongoDB
    schema: 'src/prisma/contract.prisma',

    datasource: {
        // Inyecta de forma segura tu DATABASE_URL sin que el validador estricto falle
        url: env('DATABASE_URL'),
    },
});
