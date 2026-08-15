import { prisma } from './prisma';
import { статусЭфиров, twitchНастроен, type СостояниеЭфира } from './twitch';
import {
    статусВидео,
    найтиЭфирНаКанале,
    интервалПоискаМс,
    youtubeНастроен,
} from './youtube';

/**
 * Обновление статуса эфиров.
 *
 * Вызывается по расписанию. Ходит на площадки, узнаёт, кто сейчас в эфире,
 * и записывает это в базу вместе с названием трансляции.
 *
 * Процент отсюда НЕ меняется — намеренно. Ни Twitch, ни YouTube эту цифру
 * не знают, из названия она достаётся угадыванием, а неверный процент на
 * сайте хуже устаревшего. Название сохраняем, чтобы предложить его человеку.
 *
 * КАК УСТРОЕН YOUTUBE. Поиск живого эфира на канале стоит 100 единиц квоты
 * из 10 000 в сутки, проверка известного видео — 1 единицу. Поэтому:
 *
 *   нет запомненного видео  ->  ищем на канале (дорого, редко)
 *   нашли                   ->  запоминаем id
 *   есть запомненное        ->  проверяем его (дёшево, часто)
 *   эфир кончился           ->  забываем id, возвращаемся к поиску
 *
 * Так настройка делается один раз, а квота тратится только в перерывах
 * между трансляциями.
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
    поисков: number;
    ошибки: string[];
};

export async function обновитьЭфиры(): Promise<ИтогОбновления> {
    const стримы = await prisma.stream.findMany({
        where: {
            OR: [
                { twitchLogin: { not: null } },
                { youtubeChannelId: { not: null } },
                { youtubeVideoId: { not: null } },
            ],
        },
    });

    const итог: ИтогОбновления = {
        проверено: стримы.length,
        вЭфире: 0,
        поисков: 0,
        ошибки: [],
    };

    if (стримы.length === 0) return итог;

    const сейчас = new Date();

    /* ---------- Twitch: один запрос на всех ---------- */

    const твич = new Map<string, СостояниеЭфира>();

    if (twitchНастроен()) {
        try {
            const ники = стримы.map((с) => с.twitchLogin).filter((н): н is string => Boolean(н));
            for (const [к, з] of await статусЭфиров(ники)) твич.set(к, з);
        } catch (err) {
            итог.ошибки.push(`Twitch: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    /* ---------- YouTube: сначала поиск, где пора ---------- */

    // Кому вообще может понадобиться поиск
    const сКаналом = стримы.filter((с) => с.youtubeChannelId && !с.youtubeVideoId);
    const интервал = интервалПоискаМс(
        стримы.filter((с) => с.youtubeChannelId).length,
    );

    // Найденные только что видео: id стрима -> id видео
    const найденные = new Map<string, string>();

    if (youtubeНастроен()) {
        for (const с of сКаналом) {
            const прошло = с.lastSearchAt ? сейчас.getTime() - с.lastSearchAt.getTime() : Infinity;
            if (прошло < интервал) continue;

            try {
                итог.поисков++;
                const videoId = await найтиЭфирНаКанале(с.youtubeChannelId!);

                if (videoId) найденные.set(с.id, videoId);

                // Отметку ставим в любом случае: даже неудачный поиск
                // потратил квоту, и повторять его сразу нельзя
                await prisma.stream.update({
                    where: { id: с.id },
                    data: { lastSearchAt: сейчас, youtubeVideoId: videoId },
                });
            } catch (err) {
                итог.ошибки.push(
                    `YouTube поиск (${с.playerName}): ${err instanceof Error ? err.message : String(err)}`,
                );
                // Отметку всё равно ставим, чтобы не долбить упавший API
                await prisma.stream.update({
                    where: { id: с.id },
                    data: { lastSearchAt: сейчас },
                });
            }
        }
    }

    /* ---------- YouTube: дешёвая проверка известных видео ---------- */

    const ютуб = new Map<string, СостояниеЭфира>();

    if (youtubeНастроен()) {
        const ids = стримы
            .map((с) => найденные.get(с.id) ?? с.youtubeVideoId)
            .filter((i): i is string => Boolean(i));

        if (ids.length > 0) {
            try {
                for (const [к, з] of await статусВидео(ids)) ютуб.set(к, з);
            } catch (err) {
                итог.ошибки.push(
                    `YouTube: ${err instanceof Error ? err.message : String(err)}`,
                );
            }
        }
    }

    /* ---------- Записываем ---------- */

    for (const с of стримы) {
        const videoId = найденные.get(с.id) ?? с.youtubeVideoId;

        const состояние =
            (с.twitchLogin ? твич.get(с.twitchLogin.toLowerCase()) : undefined) ??
            (videoId ? ютуб.get(videoId) : undefined);

        // Площадка не ответила — оставляем как было, а не гасим огонёк
        if (!состояние) continue;

        if (состояние.вЭфире) итог.вЭфире++;

        await prisma.stream.update({
            where: { id: с.id },
            data: {
                isLive: состояние.вЭфире,
                streamTitle: состояние.название,
                lastCheckedAt: сейчас,

                // Эфир закончился, а канал указан — забываем видео,
                // чтобы в следующий раз снова искать свежее
                youtubeVideoId:
                    !состояние.вЭфире && с.youtubeChannelId ? null : (videoId ?? null),
            },
        });
    }

    return итог;
}
