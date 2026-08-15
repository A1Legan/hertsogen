import { z } from 'zod';

/**
 * Twitch: узнать, идёт ли эфир.
 *
 * Работает через «токен приложения» — Twitch выдаёт его нашему серверу
 * по client id и секрету, без участия пользователя. Никто ни в какой
 * аккаунт не входит: мы просто спрашиваем публичные сведения.
 */

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

export function twitchНастроен(): boolean {
    return Boolean(CLIENT_ID && CLIENT_SECRET);
}

/* ------------------------------------------------------------------ *
 * ТОКЕН
 * ------------------------------------------------------------------ */

const ОтветТокена = z.object({
    access_token: z.string(),
    expires_in: z.number(),
});

/**
 * Токен живёт около двух месяцев, поэтому держим его в памяти процесса
 * и просим новый только когда старый близок к концу. Запрашивать токен
 * на каждый вызов — лишний круг к чужому серверу.
 */
let токенВПамяти: { значение: string; годенДо: number } | null = null;

async function получитьТокен(): Promise<string> {
    if (токенВПамяти && токенВПамяти.годенДо > Date.now()) {
        return токенВПамяти.значение;
    }

    const res = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID!,
            client_secret: CLIENT_SECRET!,
            grant_type: 'client_credentials',
        }),
        cache: 'no-store',
    });

    if (!res.ok) {
        // Twitch кладёт причину в тело ответа, и она бывает точной:
        // 'invalid client' — не тот id, 'invalid client secret' — не тот секрет.
        // Раньше я это выбрасывал и оставлял голый номер ошибки — искать
        // по нему причину невозможно.
        const подробности = await res.text().catch(() => '');

        const подсказка =
            res.status === 400 || res.status === 401
                ? ' Скорее всего перепутаны местами TWITCH_CLIENT_ID и TWITCH_CLIENT_SECRET, ' +
                  'либо секрет устарел — Twitch показывает его один раз.'
                : '';

        throw new Error(
            `Twitch не выдал токен: HTTP ${res.status}. ${подробности}${подсказка}`,
        );
    }

    const данные = ОтветТокена.parse(await res.json());

    токенВПамяти = {
        значение: данные.access_token,
        // Минута запаса, чтобы не попасть в момент истечения
        годенДо: Date.now() + (данные.expires_in - 60) * 1000,
    };

    return данные.access_token;
}

/* ------------------------------------------------------------------ *
 * СТАТУС ЭФИРА
 * ------------------------------------------------------------------ */

const ОтветСтримов = z.object({
    data: z.array(
        z.object({
            user_login: z.string(),
            title: z.string(),
            viewer_count: z.number().nullish(),
        }),
    ),
});

export type СостояниеЭфира = {
    вЭфире: boolean;
    название: string | null;
    зрителей: number | null;
};

/**
 * Спрашивает статус сразу для нескольких ников — Twitch позволяет
 * до 100 за один запрос. Один вызов вместо десяти.
 *
 * Возвращает словарь «ник в нижнем регистре -> состояние». Ников,
 * которых нет в ответе, там просто не будет: значит эфир не идёт.
 */
export async function статусЭфиров(
    ники: string[],
): Promise<Map<string, СостояниеЭфира>> {
    const итог = new Map<string, СостояниеЭфира>();

    const чистые = [...new Set(ники.map((н) => н.trim().toLowerCase()).filter(Boolean))];
    if (чистые.length === 0 || !twitchНастроен()) return итог;

    // Twitch принимает не больше 100 ников за раз
    for (let i = 0; i < чистые.length; i += 100) {
        const пачка = чистые.slice(i, i + 100);
        const параметры = пачка.map((н) => `user_login=${encodeURIComponent(н)}`).join('&');

        const res = await fetch(`https://api.twitch.tv/helix/streams?${параметры}`, {
            headers: {
                'Client-Id': CLIENT_ID!,
                Authorization: `Bearer ${await получитьТокен()}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Twitch вернул HTTP ${res.status}`);
        }

        const данные = ОтветСтримов.parse(await res.json());

        for (const с of данные.data) {
            итог.set(с.user_login.toLowerCase(), {
                вЭфире: true,
                название: с.title,
                зрителей: с.viewer_count ?? null,
            });
        }
    }

    // Кого не вернули — те не в эфире
    for (const ник of чистые) {
        if (!итог.has(ник)) {
            итог.set(ник, { вЭфире: false, название: null, зрителей: null });
        }
    }

    return итог;
}
