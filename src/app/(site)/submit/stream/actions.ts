'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { hashAddress, checkDefence } from '@/src/lib/submissions';
import { COUNTRY_NAME } from '@/src/lib/countries';
import { idChanel } from '@/src/lib/youtube';

const LiveForm = z
    .object({
        playerName: z.string().trim().min(1, 'Укажите ник').max(60),

        playerCountry: z
            .string()
            .trim()
            .refine((c) => c === 'Unknown' || COUNTRY_NAME.includes(c), 'Неизвестная страна'),

        levelId: z.coerce
            .number({ message: 'Выберите уровень из подсказок' })
            .int()
            .positive(),
        levelName: z.string().trim().min(1, 'Выберите уровень из подсказок').max(120),

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
    .refine((d) => d.twitch || d.youtube, {
        message: 'Укажите хотя бы одну площадку — Twitch или YouTube',
        path: ['twitch'],
    });

export type FormStatus = { error?: string } | undefined;

export async function sendStreamerMessage(
    _before: FormStatus,
    form: FormData,
): Promise<FormStatus> {
    const defence = await checkDefence(form);
    if (!defence.skip) return { error: defence.reason };

    const пусто = (v: FormDataEntryValue | null) => {
        const s = String(v ?? '').trim();
        return s === '' ? null : s;
    };

    const check = LiveForm.safeParse({
        playerName: form.get('playerName'),
        playerCountry: form.get('playerCountry') ?? 'Unknown',
        levelId: form.get('levelId'),
        levelName: form.get('levelName'),
        progress: form.get('progress') || 0,
        twitch: пусто(form.get('twitch')),
        youtube: пусто(form.get('youtube')),
        comment: пусто(form.get('comment')),
        contact: form.get('contact'),
    });

    if (!check.success) {
        return { error: check.error.issues[0]?.message ?? 'Проверьте поля' };
    }

    const d = check.data;

    let youtubeChannelId: string | null = null;

    if (d.youtube) {
        youtubeChannelId = await idChanel(d.youtube);

        if (!youtubeChannelId) {
            return {
                error:
                    'Не разобрали ссылку на канал YouTube. Подойдёт вид ' +
                    'youtube.com/@ваш-ник или youtube.com/channel/UC...',
            };
        }
    }

    await prisma.submission.create({
        data: {
            kind: 'STREAMER',
            playerName: d.playerName,
            playerCountry: d.playerCountry,
            levelId: d.levelId,
            levelName: d.levelName,
            progress: d.progress,
            videoUrl: null,
            twitchLogin: d.twitch?.toLowerCase() ?? null,
            youtubeChannelId,
            comment: d.comment,
            contact: d.contact,
            ipHash: await hashAddress(),
        },
    });

    redirect('/submit/done');
}
