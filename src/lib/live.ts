import { prisma } from './prisma';
import { статусЭфиров, twitchНастроен } from './twitch';
import { статусВидео, youtubeНастроен } from './youtube';

/**
 * Обновление статуса эфиров.
 *
 * Вызывается по расписанию. Ходит на площадки, узнаёт, кто сейчас в эфире,
 * и записывает это в базу вместе с названием трансляции.
 *
 * Процент отсюда НЕ меняется — намеренно. Ни Twitch, ни YouTube эту цифру
 * не знают, из названия она достаётся угадыванием, а неверный процент на
 * сайте хуже устаревшего. Название сохраняем, чтобы предложить его человеку.
 */

/**
 * Достаёт процент из названия трансляции.
 *
 * Это ДОГАДКА, а не факт. Стримеры пишут что угодно:
 *   'Society 43% | day 12'   -> 43   (то, что надо)
 *   'grinding Tartarus 67-89' -> 67   (а хотели, может, 89)
 *   '100% real no fake'       -> 100  (вообще не про уровень)
 *   'Society attempt 4000'    -> null (процента нет)
 *
 * Поэтому результат идёт модератору как предложение, а не в базу напрямую.
 */
export function процентИзНазвания(название: string | null): number | null {
    if (!название) return null;

    // Ищем все числа перед знаком процента и берём наибольшее:
    // в записи вида '43-67%' интереснее верхняя граница
    const найденные = [...название.matchAll(/(\d{1,3})\s*%/g)]
        .map((м) => Number(м[1]))
        .filter((n) => n >= 1 && n <= 100);

    if (найденные.length === 0) return null;

    return Math.max(...найденные);
}

export type ИтогОбновления = {
    проверено: number;
    вЭфире: number;
    ошибки: string[];
};

/**
 * Обновляет статус всех стримов, у которых указана площадка.
 *
 * Ошибка одной площадки не мешает другой: если Twitch лёг, YouTube всё
 * равно обновится. Полный отказ лучше частичного только тогда, когда
 * частичный оставляет данные в противоречивом виде — здесь не тот случай.
 */
export async function обновитьЭфиры(): Promise<ИтогОбновления> {
    const стримы = await prisma.stream.findMany({
        where: {
            OR: [{ twitchLogin: { not: null } }, { youtubeVideoId: { not: null } }],
        },
    });

    const итог: ИтогОбновления = { проверено: стримы.length, вЭфире: 0, ошибки: [] };
    if (стримы.length === 0) return итог;

    const твич = new Map<string, Awaited<ReturnType<typeof статусЭфиров>> extends Map<string, infer V> ? V : never>();
    const ютуб = new Map<string, Awaited<ReturnType<typeof статусВидео>> extends Map<string, infer V> ? V : never>();

    if (twitchНастроен()) {
        try {
            const ники = стримы.map((с) => с.twitchLogin).filter((н): н is string => Boolean(н));
            for (const [к, з] of await статусЭфиров(ники)) твич.set(к, з);
        } catch (err) {
            итог.ошибки.push(`Twitch: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    if (youtubeНастроен()) {
        try {
            const ids = стримы.map((с) => с.youtubeVideoId).filter((i): i is string => Boolean(i));
            for (const [к, з] of await статусВидео(ids)) ютуб.set(к, з);
        } catch (err) {
            итог.ошибки.push(`YouTube: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    const сейчас = new Date();

    for (const с of стримы) {
        const состояние =
            (с.twitchLogin ? твич.get(с.twitchLogin.toLowerCase()) : undefined) ??
            (с.youtubeVideoId ? ютуб.get(с.youtubeVideoId) : undefined);

        // Площадка не ответила — оставляем как было, а не гасим огонёк
        if (!состояние) continue;

        if (состояние.вЭфире) итог.вЭфире++;

        await prisma.stream.update({
            where: { id: с.id },
            data: {
                isLive: состояние.вЭфире,
                streamTitle: состояние.название,
                lastCheckedAt: сейчас,
            },
        });
    }

    return итог;
}
