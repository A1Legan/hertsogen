'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { idВидео } from '@/src/lib/youtube';

/**
 * Действия над стримами. Устроено так же, как actions.ts для новостей.
 *
 * Напоминание, почему проверка прав стоит в каждом действии: 'use server'
 * делает из функции сетевой адрес, на который можно постучаться напрямую,
 * минуя интерфейс. Middleware охраняет страницы, а не действия.
 */

async function проверитьДоступ() {
    const сессия = await auth();
    if (!сессия?.user?.email) throw new Error('Нет доступа');
    return сессия.user.email;
}

const ФормаСтрима = z.object({
    playerName: z.string().trim().min(1, 'Ник обязателен').max(100),
    playerCountry: z.string().trim().min(1).max(60),
    levelName: z.string().trim().min(1, 'Название уровня обязательно').max(150),
    // Из формы всё приходит строкой, поэтому coerce — как с очками из API
    progress: z.coerce.number().int().min(0).max(100),
    url: z.string().trim().url('Нужна полная ссылка, вместе с https://').max(300),
    isLive: z.boolean(),
    sortOrder: z.coerce.number().int().min(0).max(9999),

    /// Ник на Twitch — по нему статус эфира обновляется сам
    twitchLogin: z.string().trim().max(60).nullable(),
    /// id видео с YouTube. Принимаем и ссылку, и голый id — разберём ниже
    youtubeVideoId: z.string().trim().max(200).nullable(),
});

const пусто = (v: FormDataEntryValue | null) => {
    const s = String(v ?? '').trim();
    return s === '' ? null : s;
};

function разобратьФорму(form: FormData) {
    const данные = ФормаСтрима.parse({
        playerName: form.get('playerName'),
        playerCountry: form.get('playerCountry'),
        levelName: form.get('levelName'),
        progress: form.get('progress'),
        url: form.get('url'),
        // Невыбранный переключатель в форме не приходит вообще
        isLive: form.get('isLive') === 'on',
        sortOrder: form.get('sortOrder') || 0,
        twitchLogin: пусто(form.get('twitchLogin')),
        youtubeVideoId: пусто(form.get('youtubeVideoId')),
    });

    return {
        ...данные,
        // Ник Twitch приводим к нижнему регистру: сравнивать с ответом
        // площадки проще, когда обе стороны в одном виде
        twitchLogin: данные.twitchLogin?.toLowerCase() ?? null,
        // Из поля YouTube достаём id — человек вставит ссылку целиком,
        // и правильно сделает: помнить одиннадцать символов незачем
        youtubeVideoId: данные.youtubeVideoId ? idВидео(данные.youtubeVideoId) : null,
    };
}

function обновитьСайт() {
    revalidatePath('/');
    revalidatePath('/streams');
    revalidatePath('/admin/streams');
}

export async function создатьСтрим(form: FormData) {
    await проверитьДоступ();
    await prisma.stream.create({ data: разобратьФорму(form) });
    обновитьСайт();
    redirect('/admin/streams');
}

export async function обновитьСтрим(id: string, form: FormData) {
    await проверитьДоступ();
    await prisma.stream.update({ where: { id }, data: разобратьФорму(form) });
    обновитьСайт();
    redirect('/admin/streams');
}

export async function удалитьСтрим(id: string) {
    await проверитьДоступ();
    await prisma.stream.delete({ where: { id } });
    обновитьСайт();
}

/** Быстрое переключение «в эфире» прямо из списка. */
export async function переключитьЭфир(id: string) {
    await проверитьДоступ();

    const стрим = await prisma.stream.findUnique({ where: { id } });
    if (!стрим) return;

    await prisma.stream.update({
        where: { id },
        data: { isLive: !стрим.isLive },
    });

    обновитьСайт();
}
