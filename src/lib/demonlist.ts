import { z } from 'zod';

const API = 'https://api.demonlist.org';

const RawLevel = z.object({
    id: z.number(),
    ingame_id: z.number(),
    placement: z.number(),
    name: z.string(),

    points: z.coerce.number(),

    list_percent: z.number(),
    length: z.number(),
    holder: z.string(),

    verifier: z.object({
        user_id: z.number(),
        username: z.string(),
    }),

    verification_url: z.string(),
    date_created: z.string(),
});

const LevelListResponse = z.object({
    message: z.string(),
    data: z.object({
        levels: z.array(RawLevel),
    }),
});

const RawUser = z.object({
    id: z.number(),
    username: z.string(),
    placement: z.number(),
    points: z.coerce.number(),
    country: z.string(),
    badge: z.string()
});

const UserListResponse = z.object({
    message: z.string(),
    data: z.object({
        users: z.array(RawUser),
    }),
});

export type Level = {
    id: number;
    gdId: number;
    position: number;
    name: string;
    points: number;
    requirement: number;
    lengthSec: number;
    builder: string;
    verifier: { id: number; name: string };
    videoUrl: string | null;
    thumbnail: string | null;
};

export function youtubeId(raw: string): string | null {
    const s = String(raw).trim();

    const inUrl = s.match(/(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/|\/shorts\/)([\w-]{11})/);
    if (inUrl) return inUrl[1];

    const bare = s.match(/^([\w-]{11})(?:[?&#].*)?$/);
    if (bare) return bare[1];

    return null;
}

function toLevel(raw: z.infer<typeof RawLevel>): Level {
    const videoId = youtubeId(raw.verification_url);

    return {
        id: raw.id,
        gdId: raw.ingame_id,
        position: raw.placement,
        name: raw.name,
        points: raw.points,
        requirement: raw.list_percent,
        lengthSec: raw.length,
        builder: raw.holder,
        verifier: { id: raw.verifier.user_id, name: raw.verifier.username },

        videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
        thumbnail: videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : null,
    };
}

const TIMEOUT_MS = 10_000;

async function request(path: string, retries = 3): Promise<unknown> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const res = await fetch(API + path, {
                signal: controller.signal,
                headers: { 'User-Agent': 'h-cr/1.0 (+https://github.com/hertzzzzzz/h-cr)' },
                next: { revalidate: 3600 },
            });

            if (!res.ok) throw new Error(`${path} вернул HTTP ${res.status}`);

            return await res.json();
        } catch (err) {
        lastError = err;

        if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
            }
        } finally {
            clearTimeout(timer);
        }
    }

    throw lastError;
}

export async function getLevels(): Promise<Level[]> {
    const json = await request('/level/classic/list');

    const parsed = LevelListResponse.parse(json);

    return parsed.data.levels.map(toLevel);
}

export type Player = {
    id: number;
    name: string;
    rank: number;
    points: number;
    country: string;
};

const PAGE_SIZE = 50;

function toPlayer(raw: z.infer<typeof RawUser>): Player {
    return {
        id: raw.id,
        name: raw.username,
        rank: raw.placement,
        points: raw.points,
        country: raw.country,
    };
}

export async function getPlayers(limit = 1000): Promise<Map<number, Player>> {
    const players = new Map<number, Player>();
    let offset = 0;

    while (offset < limit) {
        const json = await request(
            `/leaderboard/user/list?limit=${PAGE_SIZE}&offset=${offset}`,
        );
        const parsed = UserListResponse.parse(json);
        const users = parsed.data.users;

        if (users.length === 0) break;

        for (const u of users) {
            players.set(u.id, toPlayer(u));
        }

        offset += PAGE_SIZE;
    }

    return players;
}

export async function getTopPlayers(count = 100): Promise<Player[]> {
    const players = await getPlayers(Math.max(count, PAGE_SIZE));
    return [...players.values()].sort((a, b) => a.rank - b.rank).slice(0, count);
}

export async function searchPlayers(query: string, limit = 100): Promise<Player[]> {
    const requestt = query.trim();
    if (!requestt) return [];

    const founded: Player[] = [];
    let offset = 0;

    while (founded.length < limit) {
        const json = await request(
            `/leaderboard/user/list?limit=${PAGE_SIZE}&offset=${offset}` +
                `&search=${encodeURIComponent(requestt)}`,
        );
        const parsed = UserListResponse.parse(json);
        const users = parsed.data.users;

        if (users.length === 0) break;

        founded.push(...users.map(toPlayer));
        offset += PAGE_SIZE;
    }

    return founded.sort((a, b) => a.rank - b.rank).slice(0, limit);
}

const RawRecord = z.object({
    id: z.number(),
    name: z.string(),
    placement: z.number(),
    video_url: z.string().nullish(),
});

const SectionList = z.array(RawRecord).nullish();

const RawProfile = z.object({
    username: z.string(),
    placement: z.number().nullish(),
    points: z.coerce.number().catch(0),
    country: z.string().catch('Unknown'),
    badge: z.string().nullish(),
    is_banned: z.boolean().nullish(),
    levels: z
        .object({
            hardest: RawRecord.nullish(),
            main: SectionList,
            extended: SectionList,
            advanced: SectionList,
            unbounded: SectionList,
            progress: SectionList,
            verified: SectionList,
        })
        .nullish(),
});

const ProfileResponse = z.object({
    message: z.string(),
    data: RawProfile,
});

export type PlayerRecord = {
    levelId: number;
    levelName: string;
    position: number;
    videoUrl: string | null;
};

export type PlayerProfile = {
    id: number;
    name: string;
    rank: number | null;
    points: number;
    country: string;
    isBanned: boolean;
    hardest: PlayerRecord | null;
    main: PlayerRecord[];
    extended: PlayerRecord[];
    advanced: PlayerRecord[];
    unbounded: PlayerRecord[];
    progress: PlayerRecord[];
    verified: PlayerRecord[];
};

function toRecord(raw: z.infer<typeof RawRecord>): PlayerRecord {
    const videoId = raw.video_url ? youtubeId(raw.video_url) : null;

    return {
        levelId: raw.id,
        levelName: raw.name,
        position: raw.placement,
        videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
    };
}

export async function getPlayerProfile(id: number): Promise<PlayerProfile | null> {
    let json: unknown;

    try {
        json = await request(`/user/get?id=${id}`);
    } catch {
        return null;
    }

    const parsed = ProfileResponse.safeParse(json);
    if (!parsed.success) return null;

    const d = parsed.data.data;
    const l = d.levels ?? {};
    const type = (x: z.infer<typeof SectionList>) => (x ?? []).map(toRecord);

    return {
        id,
        name: d.username,
        rank: d.placement ?? null,
        points: d.points,
        country: d.country,
        isBanned: d.is_banned ?? false,
        hardest: l.hardest ? toRecord(l.hardest) : null,
        main: type(l.main),
        extended: type(l.extended),
        advanced: type(l.advanced),
        unbounded: type(l.unbounded),
        progress: type(l.progress),
        verified: type(l.verified),
    };
}