'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';

async function checkAllow() {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Нет доступа');
    return session.user.email;
}

function update() {
    revalidatePath('/admin/submissions');
    revalidatePath('/admin');
    revalidatePath('/admin/streams');
    revalidatePath('/streams');
    revalidatePath('/');
}

export async function allowNessage(id: string) {
    const moderator = await checkAllow();

    const message = await prisma.submission.findUnique({ where: { id } });
    if (!message || message.status !== 'PENDING') return;

    const link =
        message.videoUrl ??
        (message.twitchLogin ? `https://www.twitch.tv/${message.twitchLogin}` : null) ??
        (message.youtubeChannelId
            ? `https://www.youtube.com/channel/${message.youtubeChannelId}`
            : null);

    if (!link) return;

    await prisma.$transaction([
        prisma.stream.create({
            data: {
                playerName: message.playerName,
                playerCountry: message.playerCountry,
                levelId: message.levelId,
                levelName: message.levelName,
                progress: message.progress,
                url: link,
                youtubeChannelId: message.youtubeChannelId,
                isLive: false,
            },
        }),
        prisma.submission.update({
            where: { id },
            data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: moderator },
        }),
    ]);

    update();
    if (message.levelId) revalidatePath(`/levels/${message.levelId}`);
}
export async function declineMessage(id: string) {
    const moderator = await checkAllow();

    await prisma.submission.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: moderator },
    });

    update();
}
export async function deleteMessage(id: string) {
    await checkAllow();
    await prisma.submission.delete({ where: { id } });
    update();
}
