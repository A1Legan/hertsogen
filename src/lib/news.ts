import { prisma } from './prisma';

/**
 * Новости.
 *
 * Раньше здесь был массив-заглушка. Теперь данные идут из базы,
 * а тип NewsItem и все страницы, которые им пользуются, не изменились
 * ни на строку. Ради этого доступ к данным и держали за функциями.
 */

export type NewsItem = {
    id: string;
    title: string;
    category: string;
    /** Дата в виде '2026-07-20' — так её ждёт вёрстка */
    date: string;
    text: string;
    image: string | null;
};

/** Дата из базы приходит объектом Date, вёрстке нужна строка. */
function кДате(d: Date): string {
    return d.toISOString().slice(0, 10);
}

/** Опубликованные новости, свежие сверху. Черновики не показываются. */
export async function getNews(): Promise<NewsItem[]> {
    const записи = await prisma.news.findMany({
        where: { published: true },
        orderBy: { date: 'desc' },
    });

    return записи.map((n) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        date: кДате(n.date),
        text: n.text,
        image: n.image,
    }));
}

/** Одна новость по id, либо null если такой нет или она черновик. */
export async function getNewsItem(id: string): Promise<NewsItem | null> {
    const n = await prisma.news.findFirst({
        where: { id, published: true },
    });

    if (!n) return null;

    return {
        id: n.id,
        title: n.title,
        category: n.category,
        date: кДате(n.date),
        text: n.text,
        image: n.image,
    };
}
