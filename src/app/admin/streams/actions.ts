'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { idКанала } from '@/src/lib/youtube';

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
    /// Канал YouTube: ссылка, @ник или сам идентификатор UC...
    youtubeChannel: z.string().trim().max(200).nullable(),
});

const пусто = (v: FormDataEntryValue | null) => {
    const s = String(v ?? '').trim();
    return s === '' ? null : s;
};

async function разобратьФорму(form: FormData) {
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
        youtubeChannel: пусто(form.get('youtubeChannel')),
    });

    // Канал превращаем в идентификатор один раз, при сохранении.
    // Человек вставит ссылку или @ник — помнить UC... наизусть незачем.
    //
    // Если разобрать не вышло, отказываем с объяснением. Раньше в таком
    // случае молча записывался null: ошибки нет, отслеживания тоже нет,
    // и понять почему невозможно.
    let youtubeChannelId: string | null = null;

    if (данные.youtubeChannel) {
        youtubeChannelId = await idКанала(данные.youtubeChannel);

        if (!youtubeChannelId) {
            throw new Error(
                'Не удалось разобрать канал YouTube. Подойдёт ссылка вида ' +
                    'youtube.com/@ник, youtube.com/channel/UC... или сам ' +
                    'идентификатор. Ссылка на конкретное видео или на другую ' +
                    'площадку не годится — для Twitch есть отдельное поле слева.',
            );
        }
    }

    const { youtubeChannel: _, ...остальное } = данные;

    return {
        ...остальное,
        // Ник Twitch приводим к нижнему регистру: сравнивать с ответом
        // площадки проще, когда обе стороны в одном виде
        twitchLogin: данные.twitchLogin?.toLowerCase() ?? null,
        youtubeChannelId,
    };
}

function обновитьСайт() {
    revalidatePath('/');
    revalidatePath('/streams');
    revalidatePath('/admin/streams');
}

export async function создатьСтрим(form: FormData) {
    await проверитьДоступ();
    await prisma.stream.create({ data: await разобратьФорму(form) });
    обновитьСайт();
    redirect('/admin/streams');
}

export async function обновитьСтрим(id: string, form: FormData) {
    await проверитьДоступ();
    await prisma.stream.update({ where: { id }, data: await разобратьФорму(form) });
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
