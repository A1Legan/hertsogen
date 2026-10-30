import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/src/generated/prisma/client';
const stringConnect = process.env.DATABASE_URL;

if (!stringConnect) {
    throw new Error('DATABASE_URL не задан. Проверь .env (локально) и переменные окружения на Vercel.');
}

function createClient() {
    const adapter = new PrismaPg({ connectionString: stringConnect });
    return new PrismaClient({ adapter });
}

const global = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const prisma = global.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
