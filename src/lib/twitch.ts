import { z } from 'zod';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

export function twitch(): boolean {
    return Boolean(CLIENT_ID && CLIENT_SECRET);
}
const tokenAnswer = z.object({
    access_token: z.string(),
    expires_in: z.number(),
});

let tokenInData: { value: string; time: number } | null = null;

async function getToken(): Promise<string> {
    if (tokenInData && tokenInData.time > Date.now()) {
        return tokenInData.value;
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
        const details = await res.text().catch(() => '');

        const hint =
            res.status === 400 || res.status === 401
                ? ' Скорее всего перепутаны местами TWITCH_CLIENT_ID и TWITCH_CLIENT_SECRET, ' +
                'либо секрет устарел — Twitch показывает его один раз.'
                : '';

        throw new Error(
            `Twitch не выдал токен: HTTP ${res.status}. ${details}${hint}`,
        );
    }

    const data = tokenAnswer.parse(await res.json());

    tokenInData = {
        value: data.access_token,
        time: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
}

const answer = z.object({
    data: z.array(
        z.object({
            user_login: z.string(),
            title: z.string(),
            viewer_count: z.number().nullish(),
        }),
    ),
});

export type liveCheck = {
    inLive: boolean;
    name: string | null;
    viewers: number | null;
};

export async function checkLive(
    nickname: string[],
): Promise<Map<string, liveCheck>> {
    const result = new Map<string, liveCheck>();

    const clear = [...new Set(nickname.map((н) => н.trim().toLowerCase()).filter(Boolean))];
    if (clear.length === 0 || !twitch()) return result;

    for (let i = 0; i < clear.length; i += 100) {
        const pack = clear.slice(i, i + 100);
        const params = pack.map((н) => `user_login=${encodeURIComponent(н)}`).join('&');

        const res = await fetch(`https://api.twitch.tv/helix/streams?${params}`, {
            headers: {
                'Client-Id': CLIENT_ID!,
                Authorization: `Bearer ${await getToken()}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Twitch вернул HTTP ${res.status}`);
        }

        const data = answer.parse(await res.json());

        for (const с of data.data) {
            result.set(с.user_login.toLowerCase(), {
                inLive: true,
                name: с.title,
                viewers: с.viewer_count ?? null,
            });
        }
    }

    for (const nickname of clear) {
        if (!result.has(nickname)) {
            result.set(nickname, { inLive: false, name: null, viewers: null });
        }
    }

    return result;
}
