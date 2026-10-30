'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { idChanel } from '@/src/lib/youtube';

async function checkAllow() {
    const сессия = await auth();
    if (!сессия?.user?.email) throw new Error('Нет доступа');
    return сессия.user.email;
}

const LiveForm = z.object({
    playerName: z.string().trim().min(1, 'Ник обязателен').max(100),
    playerCountry: z.string().trim().min(1).max(60),
    levelId: z.coerce.number({ message: 'Выберите уровень' }).int().positive(),
    levelName: z.string().trim().min(1, 'Выберите уровень').max(150),
    progress: z.coerce.number().int().min(0).max(100),
    url: z.string().trim().url('Нужна полная ссылка, вместе с https://').max(300),
    isLive: z.boolean(),
    sortOrder: z.coerce.number().int().min(0).max(9999),
    twitchLogin: z.string().trim().max(60).nullable(),
    youtubeChannel: z.string().trim().max(200).nullable(),
});

const пусто = (v: FormDataEntryValue | null) => {
    const s = String(v ?? '').trim();
    return s === '' ? null : s;
};

async function checkForm(form: FormData) {
    const data = LiveForm.parse({
        playerName: form.get('playerName'),
        playerCountry: form.get('playerCountry'),
        levelId: form.get('levelId'),
        levelName: form.get('levelName'),
        progress: form.get('progress'),
        url: form.get('url'),
        isLive: form.get('isLive') === 'on',
        sortOrder: form.get('sortOrder') || 0,
        twitchLogin: пусто(form.get('twitchLogin')),
        youtubeChannel: пусто(form.get('youtubeChannel')),
    });
    let youtubeChannelId: string | null = null;

    if (data.youtubeChannel) {
        youtubeChannelId = await idChanel(data.youtubeChannel);

        if (!youtubeChannelId) {
            throw new Error(
                'Не удалось разобрать канал YouTube. Подойдёт ссылка вида ' +
                    'youtube.com/@ник, youtube.com/channel/UC... или сам ' +
                    'идентификатор. Ссылка на конкретное видео или на другую ' +
                    'площадку не годится — для Twitch есть отдельное поле слева.',
            );
        }
    }

    const { youtubeChannel: _, ...more } = data;

    return {
        ...more,
        twitchLogin: data.twitchLogin?.toLowerCase() ?? null,
        youtubeChannelId,
    };
}
function updateSite(...levels: (number | null | undefined)[]) {
    revalidatePath('/');
    revalidatePath('/streams');
    revalidatePath('/admin/streams');

    for (const levelId of new Set(levels)) {
        if (levelId) revalidatePath(`/levels/${levelId}`);
    }
}

export async function createLive(form: FormData) {
    await checkAllow();

    const data = await checkForm(form);
    await prisma.stream.create({ data: data });

    updateSite(data.levelId);
    redirect('/admin/streams');
}

export async function updateStream(id: string, form: FormData) {
    await checkAllow();

    const before = await prisma.stream.findUnique({ where: { id } });
    const data = await checkForm(form);

    await prisma.stream.update({ where: { id }, data: data });

    updateSite(before?.levelId, data.levelId);
    redirect('/admin/streams');
}

export async function deleteLive(id: string) {
    await checkAllow();
    const live = await prisma.stream.findUnique({ where: { id } });
    await prisma.stream.delete({ where: { id } });

    updateSite(live?.levelId);
}
export async function changeLive(id: string) {
    await checkAllow();

    const live = await prisma.stream.findUnique({ where: { id } });
    if (!live) return;

    await prisma.stream.update({
        where: { id },
        data: { isLive: !live.isLive },
    });

    updateSite(live.levelId);
}
