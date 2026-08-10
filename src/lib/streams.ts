import { prisma } from './prisma';

/**
 * Стримы и прогрессы. Тоже переехали из массива в базу,
 * тип Stream и страницы остались прежними.
 */

export type Stream = {
    id: string;
    playerName: string;
    /** Название страны в формате Global Demonlist: 'United-States', 'Unknown' */
    playerCountry: string;
    levelName: string;
    /** Процент прохождения, 0–100 */
    progress: number;
    isLive: boolean;
    url: string;
};

/**
 * Сначала те, кто в эфире, потом по ручному порядку, потом по проценту.
 *
 * Сортировку делает база, а не JavaScript: ей это дешевле, и заодно
 * не приходится тащить в приложение записи, которые всё равно уйдут вниз.
 */
export async function getStreams(): Promise<Stream[]> {
    const записи = await prisma.stream.findMany({
        orderBy: [{ isLive: 'desc' }, { sortOrder: 'asc' }, { progress: 'desc' }],
    });

    return записи.map((s) => ({
        id: s.id,
        playerName: s.playerName,
        playerCountry: s.playerCountry,
        levelName: s.levelName,
        progress: s.progress,
        isLive: s.isLive,
        url: s.url,
    }));
}
