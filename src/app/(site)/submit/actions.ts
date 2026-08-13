'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { хешАдреса, проверитьЗащиту } from '@/src/lib/submissions';
import { НАЗВАНИЯ_СТРАН } from '@/src/lib/countries';

/**
 * Приём заявки на рекорд.
 *
 * Это ПУБЛИЧНОЕ действие — единственное в проекте, которое доступно
 * без входа. Поэтому проверок здесь больше, чем в админке:
 *
 *  — все поля с жёсткими границами длины
 *  — ссылка обязана быть на YouTube, а не «куда угодно»
 *  — страна только из известного списка
 *  — защита от автоматических отправок
 *
 * Данные попадают в таблицу Submission со статусом PENDING. На публичные
 * страницы оттуда не попадает ничего: они смотрят в Stream, а туда запись
 * переносит модератор вручную.
 */

const ССЫЛКА_НА_ВИДЕО = /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|live\/|shorts\/)|youtu\.be\/)[\w-]{11}/;

const ФормаЗаявки = z.object({
    playerName: z
        .string()
        .trim()
        .min(1, 'Укажите ник')
        .max(60, 'Ник слишком длинный'),

    playerCountry: z
        .string()
        .trim()
        // Страна должна быть из нашего списка, иначе флаг не найдётся.
        // Заодно это отсекает попытку записать в поле произвольный текст.
        .refine((с) => с === 'Unknown' || НАЗВАНИЯ_СТРАН.includes(с), 'Неизвестная страна'),

    levelName: z
        .string()
        .trim()
        .min(1, 'Укажите название уровня')
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
        .regex(ССЫЛКА_НА_ВИДЕО, 'Нужна ссылка на видео с YouTube'),

    comment: z.string().trim().max(500, 'Комментарий слишком длинный').nullable(),
    contact: z.string().trim().max(120).nullable(),
});

/** Что вернуть в форму, если что-то не так. */
export type СостояниеФормы = { ошибка?: string } | undefined;

export async function отправитьЗаявку(
    _прошлое: СостояниеФормы,
    form: FormData,
): Promise<СостояниеФормы> {
    const защита = await проверитьЗащиту(form);
    if (!защита.пропустить) {
        return { ошибка: защита.причина };
    }

    const пусто = (v: FormDataEntryValue | null) => {
        const s = String(v ?? '').trim();
        return s === '' ? null : s;
    };

    const разбор = ФормаЗаявки.safeParse({
        playerName: form.get('playerName'),
        playerCountry: form.get('playerCountry') ?? 'Unknown',
        levelName: form.get('levelName'),
        progress: form.get('progress'),
        videoUrl: form.get('videoUrl'),
        comment: пусто(form.get('comment')),
        contact: пусто(form.get('contact')),
    });

    if (!разбор.success) {
        // Первое понятное сообщение, а не весь список: человеку проще
        // исправлять по одному, чем читать простыню
        return { ошибка: разбор.error.issues[0]?.message ?? 'Проверьте поля' };
    }

    await prisma.submission.create({
        data: { ...разбор.data, ipHash: await хешАдреса() },
    });

    redirect('/submit/done');
}
