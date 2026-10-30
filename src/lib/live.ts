import { prisma } from './prisma';
import { checkLive, twitch, type liveCheck } from './twitch';
import {
    videoStatus,
    searchStream,
    search,
    youtube,
} from './youtube';

export function percentPerName(name: string | null): number | null {
    if (!name) return null;
    const finded = [...name.matchAll(/(\d{1,3})\s*%/g)]
        .map((m) => Number(m[1]))
        .filter((n) => n >= 1 && n <= 100);

    if (finded.length === 0) return null;

    return Math.max(...finded);
}

export type UpdateResult = {
    checked: number;
    inLive: number;
    searches: number;
    errors: string[];
};

export async function updateLive(): Promise<UpdateResult> {
    const live = await prisma.stream.findMany({
        where: {
            OR: [
                { twitchLogin: { not: null } },
                { youtubeChannelId: { not: null } },
                { youtubeVideoId: { not: null } },
            ],
        },
    });

    const result: UpdateResult = {
        checked: live.length,
        inLive: 0,
        searches: 0,
        errors: [],
    };

    if (live.length === 0) return result;

    const now = new Date();

    const twitchPage = new Map<string, liveCheck>();

    if (twitch()) {
        try {
            const nicknames = live.map((c) => c.twitchLogin).filter((н): н is string => Boolean(н));
            for (const [к, з] of await checkLive(nicknames)) twitchPage.set(к, з);
        } catch (err) {
            result.errors.push(`Twitch: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    const withChanel = live.filter((c) => c.youtubeChannelId && !c.youtubeVideoId);
    const frame = search(
        live.filter((c) => c.youtubeChannelId).length,
    );

    const founded = new Map<string, string>();

    if (youtube()) {
        for (const c of withChanel) {
            const past = c.lastSearchAt ? now.getTime() - c.lastSearchAt.getTime() : Infinity;
            if (past < frame) continue;

            try {
                result.searches++;
                const videoId = await searchStream(c.youtubeChannelId!);

                if (videoId) founded.set(c.id, videoId);

                await prisma.stream.update({
                    where: { id: c.id },
                    data: { lastSearchAt: now, youtubeVideoId: videoId },
                });
            } catch (err) {
                result.errors.push(
                    `YouTube поиск (${c.playerName}): ${err instanceof Error ? err.message : String(err)}`,
                );

                await prisma.stream.update({
                    where: { id: c.id },
                    data: { lastSearchAt: now },
                });
            }
        }
    }
    
    const youtubePage = new Map<string, liveCheck>();

    if (youtube()) {
        const ids = live
            .map((c) => founded.get(c.id) ?? c.youtubeVideoId)
            .filter((i): i is string => Boolean(i));

        if (ids.length > 0) {
            try {
                for (const [k, z] of await videoStatus(ids)) youtubePage.set(k, z);
            } catch (err) {
                result.errors.push(
                    `YouTube: ${err instanceof Error ? err.message : String(err)}`,
                );
            }
        }
    }

    for (const c of live) {
        const videoId = founded.get(c.id) ?? c.youtubeVideoId;

        const state =
            (c.twitchLogin ? twitchPage.get(c.twitchLogin.toLowerCase()) : undefined) ??
            (videoId ? youtubePage.get(videoId) : undefined);

        if (!state) continue;

        if (state.inLive) result.inLive++;

        await prisma.stream.update({
            where: { id: c.id },
            data: {
                isLive: state.inLive,
                streamTitle: state.name,
                lastCheckedAt: now,
                youtubeVideoId:
                    !state.inLive && c.youtubeChannelId ? null : (videoId ?? null),
            },
        });
    }

    return result;
}
