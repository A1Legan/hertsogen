import { z } from 'zod';
import type { СостояниеЭфира } from './twitch';

/**
 * YouTube: узнать, идёт ли ещё эфир по известному видео.
 *
 * ПОЧЕМУ ПО ID ВИДЕО, А НЕ ПО КАНАЛУ.
 *
 * Поиск живого эфира на канале — это search.list, он стоит 100 единиц
 * квоты за вызов. Суточный лимит по умолчанию 10 000, то есть сто вызовов
 * в день на весь проект. Опрос раз в пять минут для одного канала — уже 288.
 *
 * Запрос videos.list по известному id стоит 1 единицу. Те же 288 опросов
 * укладываются в 288 единиц, и остаётся ещё девять с половиной тысяч.
 *
 * Цена решения: ссылку на эфир кто-то вставляет один раз при старте.
 * Взамен — работающий счётчик вместо упёршейся в лимит квоты.
 */

const API_KEY = process.env.YOUTUBE_API_KEY;

export function youtubeНастроен(): boolean {
    return Boolean(API_KEY);
}

const ОтветВидео = z.object({
    items: z.array(
        z.object({
            id: z.string(),
            snippet: z.object({ title: z.string() }).nullish(),
            liveStreamingDetails: z
                .object({
                    /// Есть — значит эфир уже закончился
                    actualEndTime: z.string().nullish(),
                    actualStartTime: z.string().nullish(),
                    concurrentViewers: z.string().nullish(),
                })
                .nullish(),
        }),
    ),
});

/* ------------------------------------------------------------------ *
 * ПОИСК ЭФИРА НА КАНАЛЕ
 *
 * Дорогая операция: 100 единиц квоты за вызов при суточных 10 000.
 * Поэтому частоту считаем от числа каналов, а найденное видео запоминаем
 * и дальше опрашиваем уже его — за 1 единицу.
 * ------------------------------------------------------------------ */

/** Сколько поисков в сутки готовы потратить. Остальное — на дешёвые проверки. */
const БЮДЖЕТ_ПОИСКОВ_В_СУТКИ = 90;

/**
 * Как часто искать эфир на одном канале.
 *
 * Считается от числа каналов, чтобы бюджет делился поровну и не зависел
 * от того, сколько стримеров добавят завтра. Один канал — раз в 16 минут,
 * три — раз в 48, десять — раз в три часа.
 *
 * Не реже раза в 15 минут: чаще нет смысла, эфир не начинается по секундам.
 */
export function интервалПоискаМс(каналов: number): number {
    if (каналов <= 0) return Infinity;

    const поисковНаКанал = БЮДЖЕТ_ПОИСКОВ_В_СУТКИ / каналов;
    const интервал = (24 * 60 * 60 * 1000) / поисковНаКанал;

    return Math.max(15 * 60 * 1000, интервал);
}

const ОтветПоиска = z.object({
    items: z.array(
        z.object({
            id: z.object({ videoId: z.string().nullish() }).nullish(),
            snippet: z.object({ title: z.string().nullish() }).nullish(),
        }),
    ),
});

/**
 * Ищет живой эфир на канале. Возвращает id видео или null.
 *
 * Каждый вызов — 100 единиц квоты, поэтому вызывать только тогда,
 * когда интервал действительно прошёл.
 */
export async function найтиЭфирНаКанале(channelId: string): Promise<string | null> {
    if (!youtubeНастроен()) return null;

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'id,snippet');
    url.searchParams.set('channelId', channelId);
    url.searchParams.set('eventType', 'live');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('key', API_KEY!);

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
        const тело = await res.text().catch(() => '');
        throw new Error(`Поиск эфира на канале вернул HTTP ${res.status}. ${тело.slice(0, 200)}`);
    }

    const данные = ОтветПоиска.parse(await res.json());
    return данные.items[0]?.id?.videoId ?? null;
}

/**
 * Превращает ссылку на канал в его id.
 *
 * Принимает три вида: /channel/UC..., /@ник и просто UC....
 * Для ника нужен запрос к API — но он стоит 1 единицу, и делается
 * один раз при сохранении, а не при каждой проверке.
 */
export async function idКанала(строка: string): Promise<string | null> {
    const s = строка.trim();

    // Сам идентификатор или ссылка вида /channel/UC...
    const прямой = s.match(/(?:channel\/)?(UC[\w-]{22})/);
    if (прямой) return прямой[1];

    // Ссылка вида youtube.com/@ник или просто @ник
    const ник = s.match(/(?:youtube\.com\/)?@([\w.-]+)/);
    if (!ник || !youtubeНастроен()) return null;

    const url = new URL('https://www.googleapis.com/youtube/v3/channels');
    url.searchParams.set('part', 'id');
    url.searchParams.set('forHandle', '@' + ник[1]);
    url.searchParams.set('key', API_KEY!);

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const данные = await res.json();
    return данные?.items?.[0]?.id ?? null;
}

/** Достаёт 11-символьный id видео из любой формы ссылки YouTube. */
export function idВидео(строка: string): string | null {
    const s = строка.trim();

    const вСсылке = s.match(
        /(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/|\/shorts\/)([\w-]{11})/,
    );
    if (вСсылке) return вСсылке[1];

    const голый = s.match(/^([\w-]{11})(?:[?&#].*)?$/);
    return голый ? голый[1] : null;
}

/**
 * Статус сразу для нескольких видео — YouTube принимает до 50 id
 * в одном запросе, и это по-прежнему 1 единица квоты.
 */
export async function статусВидео(
    ids: string[],
): Promise<Map<string, СостояниеЭфира>> {
    const итог = new Map<string, СостояниеЭфира>();

    const чистые = [...new Set(ids.map((i) => i.trim()).filter(Boolean))];
    if (чистые.length === 0 || !youtubeНастроен()) return итог;

    for (let i = 0; i < чистые.length; i += 50) {
        const пачка = чистые.slice(i, i + 50);

        const url = new URL('https://www.googleapis.com/youtube/v3/videos');
        url.searchParams.set('part', 'snippet,liveStreamingDetails');
        url.searchParams.set('id', пачка.join(','));
        url.searchParams.set('key', API_KEY!);

        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error(`YouTube вернул HTTP ${res.status}`);
        }

        const данные = ОтветВидео.parse(await res.json());

        for (const в of данные.items) {
            const детали = в.liveStreamingDetails;

            // Эфир идёт, если он начался и ещё не закончился.
            // У обычного, не прямого эфира liveStreamingDetails нет вовсе.
            const вЭфире = Boolean(детали?.actualStartTime && !детали?.actualEndTime);

            итог.set(в.id, {
                вЭфире,
                название: в.snippet?.title ?? null,
                зрителей: детали?.concurrentViewers
                    ? Number(детали.concurrentViewers)
                    : null,
            });
        }
    }

    // Видео, которых не вернули (удалено, закрыто) — считаем не в эфире
    for (const id of чистые) {
        if (!итог.has(id)) {
            итог.set(id, { вЭфире: false, название: null, зрителей: null });
        }
    }

    return итог;
}
