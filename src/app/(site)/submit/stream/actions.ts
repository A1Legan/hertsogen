'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { хешАдреса, проверитьЗащиту } from '@/src/lib/submissions';
import { НАЗВАНИЯ_СТРАН } from '@/src/lib/countries';
import { idКанала } from '@/src/lib/youtube';

/**
 * Заявка стримера: «я вещаю там-то, добавьте меня в список».
 *
 * ПУБЛИЧНОЕ действие, как и заявка на рекорд. Проверки те же плюс одна
 * своя: должна быть указана хотя бы одна площадка, иначе отслеживать
 * нечего и запись будет мёртвой.
 */

const ФормаСтримера = z
    .object({
        playerName: z.string().trim().min(1, 'Укажите ник').max(60),

        playerCountry: z
            .string()
            .trim()
            .refine((с) => с === 'Unknown' || НАЗВАНИЯ_СТРАН.includes(с), 'Неизвестная страна'),

        levelName: z.string().trim().min(1, 'Укажите уровень').max(120),

        progress: z.coerce
            .number()
            .int('Процент — целое число')
            .min(0)
            .max(100, 'Больше 100% не бывает'),

        twitch: z.string().trim().max(60).nullable(),
        youtube: z.string().trim().max(200).nullable(),

        comment: z.string().trim().max(500).nullable(),
        contact: z.string().trim().min(1, 'Укажите, как с вами связаться').max(120),
    })
    .refine((д) => д.twitch || д.youtube, {
        message: 'Укажите хотя бы одну площадку — Twitch или YouTube',
        path: ['twitch'],
    });

export type СостояниеФормы = { ошибка?: string } | undefined;

export async function отправитьЗаявкуСтримера(
    _прошлое: СостояниеФормы,
    form: FormData,
): Promise<СостояниеФормы> {
    const защита = await проверитьЗащиту(form);
    if (!защита.пропустить) return { ошибка: защита.причина };

    const пусто = (v: FormDataEntryValue | null) => {
        const s = String(v ?? '').trim();
        return s === '' ? null : s;
    };

    const разбор = ФормаСтримера.safeParse({
        playerName: form.get('playerName'),
        playerCountry: form.get('playerCountry') ?? 'Unknown',
        levelName: form.get('levelName'),
        progress: form.get('progress') || 0,
        twitch: пусто(form.get('twitch')),
        youtube: пусто(form.get('youtube')),
        comment: пусто(form.get('comment')),
        contact: form.get('contact'),
    });

    if (!разбор.success) {
        return { ошибка: разбор.error.issues[0]?.message ?? 'Проверьте поля' };
    }

    const д = разбор.data;

    // Канал YouTube разбираем сразу: если ссылка кривая, лучше сказать
    // человеку сейчас, чем модератору через два дня
    let youtubeChannelId: string | null = null;

    if (д.youtube) {
        youtubeChannelId = await idКанала(д.youtube);

        if (!youtubeChannelId) {
            return {
                ошибка:
                    'Не разобрали ссылку на канал YouTube. Подойдёт вид ' +
                    'youtube.com/@ваш-ник или youtube.com/channel/UC...',
            };
        }
    }

    await prisma.submission.create({
        data: {
            kind: 'STREAMER',
            playerName: д.playerName,
            playerCountry: д.playerCountry,
            levelName: д.levelName,
            progress: д.progress,
            videoUrl: null,
            twitchLogin: д.twitch?.toLowerCase() ?? null,
            youtubeChannelId,
            comment: д.comment,
            contact: д.contact,
            ipHash: await хешАдреса(),
        },
    });

    redirect('/submit/done');
}
