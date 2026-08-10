import { z } from 'zod';

const API = 'https://api.demonlist.org';

// Просто схема для БДшки

const RawLevel = z.object({
    id: z.number(),
    ingame_id: z.number(),
    placement: z.number(),
    name: z.string(),

  // Приходит СТРОКОЙ: "1000.00"
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

// Наш формат уровней

export type Level = {
    id: number;
    gdId: number;
    position: number;
    name: string;
    points: number; // уже число, не строка
    requirement: number;
    lengthSec: number;
    builder: string;
    verifier: { id: number; name: string };
    videoUrl: string | null;
    /** null = видео нет, превью взять неоткуда. Рисуем нейтральный блок. */
    thumbnail: string | null;
};

// У некоторых уровней в Global траблы с ссылками. (Для примера щас существует
// PSYCHOPATH. У него ссылка как бы есть, но она без https://youtube.com/..., так
// что если тыкнуть на иконку видео в списке уровней, (не в профиле уровня, это важно)
// то можно смело пойти нахуй просто) Поэтому из JSON файлика уровней мы будем брать
// только айдишник видео и поставлять к собственной ссылке

// Заглушки для превью уровня нет намеренно: у уровней своей картинки
// не существует в принципе, превью — это кадр из видео. Нет видео —
// нет и превью, рисуем серый блок. (default.jpg в старом репозитории —
// это заглушка для АВАТАРОК игроков, к уровням отношения не имеет.)

export function youtubeId(raw: string): string | null {
    const s = String(raw).trim();

  // youtu.be/ID, ?v=ID, /live/ID, /embed/ID, /shorts/ID
    const inUrl = s.match(/(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/|\/shorts\/)([\w-]{11})/);
    if (inUrl) return inUrl[1];

  // голый идентификатор, иногда с хвостом вида ?si=...
    const bare = s.match(/^([\w-]{11})(?:[?&#].*)?$/);
    if (bare) return bare[1];

    return null;
}

// Теперь переделаем полученный уровень в удобный нам

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

//Запрос с таймаутом

const TIMEOUT_MS = 10_000;

async function request(path: string, retries = 3): Promise<unknown> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
        // Без таймаута зависший запрос будет висеть вечно и держать сборку
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const res = await fetch(API + path, {
                signal: controller.signal,
                headers: { 'User-Agent': 'h-cr/1.0 (+https://github.com/hertzzzzzz/h-cr)' },

                // ВАЖНО. Без этой строки Next ничего не кэширует, и при сборке
                // каждая из ~650 страниц сходила бы в API заново — тысячи
                // запросов и бан по IP. С ней ответ берётся из кэша Next,
                // а к чужому серверу мы обращаемся считанные разы.
                next: { revalidate: 3600 },
            });

            if (!res.ok) throw new Error(`${path} вернул HTTP ${res.status}`);

            return await res.json();
        } catch (err) {
        lastError = err;

      // Пауза перед следующей попыткой растёт: 1с, 2с, 4с.
      // Долбить упавший сервер без передышки — плохая идея.

        if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
            }
        } finally {
            clearTimeout(timer);
        }
    }

    throw lastError;
}

// Чисто наше, для сайта

export async function getLevels(): Promise<Level[]> {
    const json = await request('/level/classic/list');

  // Вот здесь чужие данные проверяются и становятся нашими.
  // Если API поменяется — упадёт ровно тут, с внятным сообщением,
  // а не где-то в компоненте через три файла.
    const parsed = LevelListResponse.parse(json);

    return parsed.data.levels.map(toLevel);
}



/* ------------------------------------------------------------------ *
 * ИГРОКИ
 *
 * Лидерборд отдаётся страницами по 50 (больше сервер не принимает,
 * проверено: limit=100 и выше возвращают пустоту).
 * Всего аккаунтов ~12726, то есть 255 страниц на полную выгрузку.
 *
 * Поэтому по умолчанию берём только первую тысячу: этого хватает,
 * чтобы найти 90 верификаторов из 102 в топ-150 уровней.
 * Полная выгрузка — задача ночной синхронизации в БД, не сборки сайта.
 * ------------------------------------------------------------------ */

export type Player = {
    id: number;
    name: string;
    rank: number;
    points: number;
    /** Название страны как отдаёт API: 'United-States', 'Unknown' и т.д. */
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

/**
 * Возвращает словарь «id игрока -> игрок».
 * Map, а не массив: искать по id нужно для каждой из 150 карточек,
 * и перебор массива тут был бы лишней работой.
 */
export async function getPlayers(limit = 1000): Promise<Map<number, Player>> {
    const players = new Map<number, Player>();
    let offset = 0;

    while (offset < limit) {
        const json = await request(
            `/leaderboard/user/list?limit=${PAGE_SIZE}&offset=${offset}`,
        );
        const parsed = UserListResponse.parse(json);
        const users = parsed.data.users;

        // Пустая страница = игроки кончились раньше лимита
        if (users.length === 0) break;

        for (const u of users) {
            players.set(u.id, toPlayer(u));
        }

        offset += PAGE_SIZE;
    }

    return players;
}

/** Топ игроков по местам — для страницы /players и сайдбара. */
export async function getTopPlayers(count = 100): Promise<Player[]> {
    const players = await getPlayers(Math.max(count, PAGE_SIZE));
    return [...players.values()].sort((a, b) => a.rank - b.rank).slice(0, count);
}

/* ------------------------------------------------------------------ *
 * ПРОФИЛЬ ИГРОКА  —  /user/get?id=
 *
 * Отдаёт пройденные уровни, разбитые по разделам списка.
 *
 * ВНИМАНИЕ: схема ниже нарочно мягкая. Схему уровней мы писали по отчёту
 * inspect.ts, прогнав все 1808 записей, и поэтому там всё обязательное.
 * А этот ответ я видел ровно один раз, у одного игрока. Значит про поля
 * ничего не известно: у новичка без прохождений разделов может не быть
 * вовсе, hardest может отсутствовать, uncompleted приходит null.
 *
 * Строгость схемы должна соответствовать тому, сколько данных ты проверил.
 * Когда прогонишь inspect.ts по сотне игроков — можно будет ужесточить.
 * ------------------------------------------------------------------ */

const RawRecord = z.object({
    id: z.number(),
    name: z.string(),
    placement: z.number(),
    video_url: z.string().nullish(),
});

const РазделСписка = z.array(RawRecord).nullish();

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
            main: РазделСписка,
            extended: РазделСписка,
            advanced: РазделСписка,
            unbounded: РазделСписка,
            progress: РазделСписка,
            verified: РазделСписка,
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
    /** Самый сложный пройденный уровень */
    hardest: PlayerRecord | null;
    /** Пройденные, по разделам списка */
    main: PlayerRecord[];
    extended: PlayerRecord[];
    advanced: PlayerRecord[];
    unbounded: PlayerRecord[];
    /** Незавершённые прогрессы */
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

/** Профиль игрока со всеми его прохождениями. null, если игрока нет. */
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
    const раздел = (x: z.infer<typeof РазделСписка>) => (x ?? []).map(toRecord);

    return {
        id,
        name: d.username,
        rank: d.placement ?? null,
        points: d.points,
        country: d.country,
        isBanned: d.is_banned ?? false,
        hardest: l.hardest ? toRecord(l.hardest) : null,
        main: раздел(l.main),
        extended: раздел(l.extended),
        advanced: раздел(l.advanced),
        unbounded: раздел(l.unbounded),
        progress: раздел(l.progress),
        verified: раздел(l.verified),
    };
}