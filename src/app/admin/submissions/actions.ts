'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';

/**
 * Модерация заявок.
 *
 * Одобрение — это НЕ смена флага, а перенос данных из Submission в Stream.
 * Заявка остаётся на месте со статусом APPROVED, а на сайте появляется
 * отдельная запись, которую можно править, не трогая присланное.
 *
 * Так лучше по двум причинам. Во-первых, видно историю: кто что присылал
 * и что с этим стало. Во-вторых, если модератор поправит опечатку в нике,
 * исходная заявка останется как есть — будет с чем сверить.
 */

async function проверитьДоступ() {
    const сессия = await auth();
    if (!сессия?.user?.email) throw new Error('Нет доступа');
    return сессия.user.email;
}

function обновить() {
    revalidatePath('/admin/submissions');
    revalidatePath('/admin');
    revalidatePath('/admin/streams');
    revalidatePath('/streams');
    revalidatePath('/');
}

/** Одобрить: создать стрим по заявке и пометить её принятой. */
export async function одобритьЗаявку(id: string) {
    const модератор = await проверитьДоступ();

    const заявка = await prisma.submission.findUnique({ where: { id } });
    if (!заявка || заявка.status !== 'PENDING') return;

    // Ссылка, по которой посетитель попадёт к стримеру.
    //
    // У рекорда это видео прохождения. У стримера видео может не быть
    // вовсе, зато есть площадка — собираем ссылку из неё.
    const ссылка =
        заявка.videoUrl ??
        (заявка.twitchLogin ? `https://www.twitch.tv/${заявка.twitchLogin}` : null) ??
        (заявка.youtubeChannelId
            ? `https://www.youtube.com/channel/${заявка.youtubeChannelId}`
            : null);

    if (!ссылка) return; // ни видео, ни площадки — показывать нечего

    // Две операции одной транзакцией: если создание стрима упадёт,
    // заявка не должна остаться помеченной как одобренная
    await prisma.$transaction([
        prisma.stream.create({
            data: {
                playerName: заявка.playerName,
                playerCountry: заявка.playerCountry,
                levelName: заявка.levelName,
                progress: заявка.progress,
                url: ссылка,

                // Площадки переносим как есть — с этого момента статус
                // «в эфире» начнёт обновляться сам, без участия человека
                twitchLogin: заявка.twitchLogin,
                youtubeChannelId: заявка.youtubeChannelId,

                // Пока не проверили площадку — считаем, что не в эфире.
                // Первое же обновление поставит настоящее значение.
                isLive: false,
            },
        }),
        prisma.submission.update({
            where: { id },
            data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: модератор },
        }),
    ]);

    обновить();
}

/** Отклонить: заявка остаётся в истории, на сайт ничего не попадает. */
export async function отклонитьЗаявку(id: string) {
    const модератор = await проверитьДоступ();

    await prisma.submission.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: модератор },
    });

    обновить();
}

/** Удалить окончательно — для спама, который незачем хранить. */
export async function удалитьЗаявку(id: string) {
    await проверитьДоступ();
    await prisma.submission.delete({ where: { id } });
    обновить();
}
