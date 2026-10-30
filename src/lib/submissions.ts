import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { prisma } from './prisma';

export async function hashAddress(): Promise<string> {
    const h = await headers();

    const address =
        h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'неизвестен';

    return createHash('sha256')
        .update(address + (process.env.AUTH_SECRET ?? ''))
        .digest('hex')
        .slice(0, 32);
}

const MAX_PER_HOUR = 3;
const MIN_PER_SEC = 3;

export type declineDefence = { skip: false; reason: string };
export type aswerDefence = { skip: true } | declineDefence;

export async function checkDefence(form: FormData): Promise<aswerDefence> {
    const trap = String(form.get('website') ?? '');
    if (trap.trim() !== '') {
        return { skip: false, reason: 'Заявка не отправлена' };
    }

    const hint = Number(form.get('открытоВ'));
    if (Number.isFinite(hint) && hint > 0) {
        const sec = (Date.now() - hint) / 1000;
        if (sec < MIN_PER_SEC) {
            return { skip: false, reason: 'Слишком быстро — попробуйте ещё раз' };
        }
    }

    const ipHash = await hashAddress();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const resent = await prisma.submission.count({
        where: { ipHash, createdAt: { gte: hourAgo } },
    });

    if (resent >= MAX_PER_HOUR) {
        return {
            skip: false,
            reason: `Не больше ${MAX_PER_HOUR} заявок в час. Попробуйте позже.`,
        };
    }

    return { skip: true };
}
export async function waitCheck(): Promise<number> {
    return prisma.submission.count({ where: { status: 'PENDING' } });
}
