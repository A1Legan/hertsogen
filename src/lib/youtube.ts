import { z } from 'zod';
import type { liveCheck as liveCheck } from './twitch';

const API_KEY = process.env.YOUTUBE_API_KEY;

export function youtube(): boolean {
    return Boolean(API_KEY);
}

const request = z.object({
    items: z.array(
        z.object({
            id: z.string(),
            snippet: z.object({ title: z.string() }).nullish(),
            liveStreamingDetails: z
                .object({
                    actualEndTime: z.string().nullish(),
                    actualStartTime: z.string().nullish(),
                    concurrentViewers: z.string().nullish(),
                })
                .nullish(),
        }),
    ),
});

const amount = 90;

export function search(chanel: number): number {
    if (chanel <= 0) return Infinity;

    const searched = amount / chanel;
    const interval = (24 * 60 * 60 * 1000) / searched;

    return Math.max(15 * 60 * 1000, interval);
}

const answer = z.object({
    items: z.array(
        z.object({
            id: z.object({ videoId: z.string().nullish() }).nullish(),
            snippet: z.object({ title: z.string().nullish() }).nullish(),
        }),
    ),
});

export async function searchStream(channelId: string): Promise<string | null> {
    if (!youtube()) return null;

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

    const data = answer.parse(await res.json());
    return data.items[0]?.id?.videoId ?? null;
}

export async function idChanel(string: string): Promise<string | null> {
    const s = string.trim();

    const live = s.match(/(?:channel\/)?(UC[\w-]{22})/);
    if (live) return live[1];

    const nickname = s.match(/(?:youtube\.com\/)?@([\w.-]+)/);
    if (!nickname || !youtube()) return null;

    const url = new URL('https://www.googleapis.com/youtube/v3/channels');
    url.searchParams.set('part', 'id');
    url.searchParams.set('forHandle', '@' + nickname[1]);
    url.searchParams.set('key', API_KEY!);

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json();
    return data?.items?.[0]?.id ?? null;
}

export function idVideo(string: string): string | null {
    const s = string.trim();

    const inLink = s.match(
        /(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/|\/shorts\/)([\w-]{11})/,
    );
    if (inLink) return inLink[1];

    const free = s.match(/^([\w-]{11})(?:[?&#].*)?$/);
    return free ? free[1] : null;
}

export async function videoStatus(
    ids: string[],
): Promise<Map<string, liveCheck>> {
    const total = new Map<string, liveCheck>();

    const free = [...new Set(ids.map((i) => i.trim()).filter(Boolean))];
    if (free.length === 0 || !youtube()) return total;

    for (let i = 0; i < free.length; i += 50) {
        const pack = free.slice(i, i + 50);

        const url = new URL('https://www.googleapis.com/youtube/v3/videos');
        url.searchParams.set('part', 'snippet,liveStreamingDetails');
        url.searchParams.set('id', pack.join(','));
        url.searchParams.set('key', API_KEY!);

        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error(`YouTube вернул HTTP ${res.status}`);
        }

        const data = request.parse(await res.json());

        for (const live of data.items) {
            const details = live.liveStreamingDetails;

            const inLive = Boolean(details?.actualStartTime && !details?.actualEndTime);

            total.set(live.id, {
                inLive: inLive,
                name: live.snippet?.title ?? null,
                viewers: details?.concurrentViewers
                    ? Number(details.concurrentViewers)
                    : null,
            });
        }
    }

    for (const id of free) {
        if (!total.has(id)) {
            total.set(id, { inLive: false, name: null, viewers: null });
        }
    }

    return total;
}
