'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { hashAddress, checkDefence } from '@/src/lib/submissions';
import { COUNTRY_NAME } from '@/src/lib/countries';

const LINK_ON_VIDEO = /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|live\/|shorts\/)|youtu\.be\/)[\w-]{11}/;

const FormMessage = z.object({
    playerName: z
        .string()
        .trim()
        .min(1, 'Укажите ник')
        .max(60, 'Ник слишком длинный'),

    playerCountry: z
        .string()
        .trim()
        .refine((c) => c === 'Unknown' || COUNTRY_NAME.includes(c), 'Неизвестная страна'),

    levelId: z.coerce.number({ message: 'Выберите уровень из подсказок' }).int().positive(),

    levelName: z
        .string()
        .trim()
        .min(1, 'Выберите уровень из подсказок')
        .max(120, 'Название слишком длинное'),

    progress: z.coerce
        .number()
        .int('Процент — целое число')
        .min(1, 'Процент должен быть больше нуля')
        .max(100, 'Больше 100% не бывает'),

    videoUrl: z
        .string()
        .trim()
        .max(200)
        .regex(LINK_ON_VIDEO, 'Нужна ссылка на видео с YouTube'),

    comment: z.string().trim().max(500, 'Комментарий слишком длинный').nullable(),
    contact: z.string().trim().max(120).nullable(),
});

export type FormStatus = { error?: string } | undefined;

export async function sendMessage(
    _before: FormStatus,
    form: FormData,
): Promise<FormStatus> {
    const защита = await checkDefence(form);
    if (!защита.skip) {
        return { error: защита.reason };
    }

    const пусто = (v: FormDataEntryValue | null) => {
        const s = String(v ?? '').trim();
        return s === '' ? null : s;
    };

    const check = FormMessage.safeParse({
        playerName: form.get('playerName'),
        playerCountry: form.get('playerCountry') ?? 'Unknown',
        levelId: form.get('levelId'),
        levelName: form.get('levelName'),
        progress: form.get('progress'),
        videoUrl: form.get('videoUrl'),
        comment: пусто(form.get('comment')),
        contact: пусто(form.get('contact')),
    });

    if (!check.success) {
        return { error: check.error.issues[0]?.message ?? 'Проверьте поля' };
    }

    await prisma.submission.create({
        data: { ...check.data, ipHash: await hashAddress() },
    });

    redirect('/submit/done');
}
