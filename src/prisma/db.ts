import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// 1. Validamos la variable de entorno explícitamente
const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('❌ FATAL: DATABASE_URL no está definida en las variables de entorno.');
}

// 2. Prevenimos múltiples instancias en entorno de desarrollo (Hot Reloading / Watch mode)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}