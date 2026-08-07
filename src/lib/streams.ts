/**
 * Стримы и прогрессы.
 *
 * ЗАГЛУШКА, как и news.ts. Меняется только тело getStreams().
 *
 * Важное отличие от уровней и игроков: это единственные по-настоящему
 * живые данные на сайте. Статус LIVE/OFFLINE меняется в течение дня,
 * поэтому когда появится настоящий источник, страницу стримов, скорее
 * всего, придётся обновлять чаще остальных (см. revalidate на странице).
 */

export type Stream = {
    id: string;
    playerName: string;
    playerCountry: string;
    levelName: string;
    /** Процент прохождения, 0-100 */
    progress: number;
    isLive: boolean;
    url: string;
};

const ЗАГЛУШКА: Stream[] = [
    {
        id: '1',
        playerName: 'Zoink',
        playerCountry: 'United-States',
        levelName: 'Society',
        progress: 64,
        isLive: true,
        url: 'https://www.twitch.tv/',
    },
    {
        id: '2',
        playerName: 'wPopoff',
        playerCountry: 'United-States',
        levelName: 'Thinking Space II',
        progress: 41,
        isLive: false,
        url: 'https://www.twitch.tv/',
    },
    {
        id: '3',
        playerName: 'iMist',
        playerCountry: 'Unknown',
        levelName: 'Amethyst',
        progress: 88,
        isLive: false,
        url: 'https://www.twitch.tv/',
    },
];

/** Стримы: сначала те, кто в эфире, потом по убыванию прогресса. */
export async function getStreams(): Promise<Stream[]> {
    return [...ЗАГЛУШКА].sort((a, b) => {
        if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
        return b.progress - a.progress;
    });
}
