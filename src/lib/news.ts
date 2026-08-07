/**
 * Новости.
 *
 * ЗАГЛУШКА. Сейчас данные лежат прямо здесь, в массиве ниже.
 *
 * Когда напарник доделает БД, меняется ТОЛЬКО тело getNews() и getNewsItem():
 * вместо чтения из массива будет запрос к базе. Тип NewsItem и все страницы,
 * которые им пользуются, остаются нетронутыми.
 *
 * Это и есть смысл держать доступ к данным за отдельной функцией.
 */

export type NewsItem = {
    id: string;
    title: string;
    category: string;
    /** Дата в формате ISO: '2026-07-20' */
    date: string;
    text: string;
    image: string | null;
};

const ЗАГЛУШКА: NewsItem[] = [
    {
        id: '3',
        title: 'Society занимает первое место списка',
        category: 'Список',
        date: '2026-06-21',
        text: 'Уровень от Neomarbilan, верифицированный wPopoff, встал на первую строчку классического списка и оценивается в 1000 очков.',
        image: null,
    },
    {
        id: '2',
        title: 'Сайт переезжает на новый движок',
        category: 'Сайт',
        date: '2026-07-20',
        text: 'Данные теперь берутся напрямую из Global Demonlist API, страницы собираются заранее и открываются мгновенно.',
        image: null,
    },
    {
        id: '1',
        title: 'Открытие H&CR',
        category: 'Сайт',
        date: '2026-07-01',
        text: 'Демонлист, понятный новичку. Мы объясняем, что означает каждая цифра, вместо того чтобы просто её показать.',
        image: null,
    },
];

/** Все новости, свежие сверху. */
export async function getNews(): Promise<NewsItem[]> {
    return [...ЗАГЛУШКА].sort((a, b) => b.date.localeCompare(a.date));
}

/** Одна новость по id, либо null если такой нет. */
export async function getNewsItem(id: string): Promise<NewsItem | null> {
    const all = await getNews();
    return all.find((n) => n.id === id) ?? null;
}
