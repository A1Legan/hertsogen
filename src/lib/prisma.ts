import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/src/generated/prisma/client';

/**
 * Единственное подключение к базе на весь проект.
 *
 * Prisma 7 не подключается к базе сама — ей нужен драйвер-адаптер.
 * PrismaPg берёт на себя разговор с Postgres, Prisma только строит запросы.
 *
 * Зачем обёртка через globalThis, а не просто `new PrismaClient()`:
 * в разработке Next перезагружает изменённые модули на лету, не перезапуская
 * процесс. Без этой обёртки при каждом сохранении файла появлялось бы новое
 * подключение — и через полчаса работы к базе висело бы полсотни соединений.
 * Neon на бесплатном тарифе их ограничивает, и всё начало бы падать без
 * внятной причины. globalThis перезагрузку переживает, поэтому клиент там.
 * В продакшене перезагрузок нет, там эта ветка не нужна.
 */

const строкаПодключения = process.env.DATABASE_URL;

if (!строкаПодключения) {
    // Падаем сразу и с понятным текстом, а не где-то в первом же запросе
    throw new Error('DATABASE_URL не задан. Проверь .env (локально) и переменные окружения на Vercel.');
}

function создатьКлиент() {
    const adapter = new PrismaPg({ connectionString: строкаПодключения });
    return new PrismaClient({ adapter });
}

const глобальный = globalThis as unknown as { prisma?: ReturnType<typeof создатьКлиент> };

export const prisma = глобальный.prisma ?? создатьКлиент();

if (process.env.NODE_ENV !== 'production') {
    глобальный.prisma = prisma;
}
