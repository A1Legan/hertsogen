import { prisma } from './prisma';

export type NewsItem = {
    id: string;
    title: string;
    category: string;
    date: string;
    text: string;
    image: string | null;
};

function toDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export async function getNews(): Promise<NewsItem[]> {
    const news = await prisma.news.findMany({
        where: { published: true },
        orderBy: { date: 'desc' },
    });

    return news.map((n) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        date: toDate(n.date),
        text: n.text,
        image: n.image,
    }));
}

export async function getNewsItem(id: string): Promise<NewsItem | null> {
    const n = await prisma.news.findFirst({
        where: { id, published: true },
    });

    if (!n) return null;

    return {
        id: n.id,
        title: n.title,
        category: n.category,
        date: toDate(n.date),
        text: n.text,
        image: n.image,
    };
}
