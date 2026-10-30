'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { getLevels } from '@/src/lib/demonlist';

async function checkAllow() {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error('Нет доступа');
    }

    return session.user.email;
}

function updateSite() {
    revalidatePath('/levels/community');
    revalidatePath('/admin/ranking');
    revalidatePath('/admin');
}

const Form = z.object({
    requirement: z.coerce.number().int().min(1).max(100),
    note: z
        .string()
        .trim()
        .max(500)
        .transform((s) => s || null),
});

function checkForm(form: FormData) {
    return Form.parse({
        requirement: form.get('requirement'),
        note: form.get('note') ?? '',
    });
}

const LevelId = z.coerce
    .number({ message: 'Уровень не выбран' })
    .int()
    .positive('Уровень не выбран');

async function checkLevel(levelId: number) {
    const уровни = await getLevels();

    if (!уровни.some((l) => l.id === levelId)) {
        throw new Error(
            `Уровня с id ${levelId} нет в списке Global Demonlist. ` +
                'Выберите уровень через поиск по названию.',
        );
    }
}

async function renumber(number: number[]) {
    await prisma.$transaction(
        number.map((levelId, index) =>
            prisma.communityRank.update({
                where: { levelId },
                data: { position: index + 1 },
            }),
        ),
    );
}

async function actualNumber(): Promise<number[]> {
    const marks = await prisma.communityRank.findMany({
        orderBy: { position: 'asc' },
        select: { levelId: true },
    });

    return marks.map((z) => z.levelId);
}

export async function addLevel(form: FormData) {
    await checkAllow();

    const data = checkForm(form);
    const levelId = LevelId.parse(form.get('levelId'));

    await checkLevel(levelId);

    const already = await prisma.communityRank.findUnique({ where: { levelId } });

    if (already) {
        throw new Error('Этот уровень уже есть в списке — найдите его и поправьте.');
    }

    const all = await prisma.communityRank.count();

    await prisma.communityRank.create({
        data: { ...data, levelId, position: all + 1 },
    });

    updateSite();
    redirect('/admin/ranking');
}

export async function updateLevel(levelId: number, form: FormData) {
    await checkAllow();

    const data = checkForm(form);
    const newPos = z.coerce.number().int().min(1).parse(form.get('position'));

    const marks = await prisma.communityRank.findUnique({ where: { levelId } });
    if (!marks) throw new Error('Записи нет — возможно, её уже удалили');

    await prisma.communityRank.update({
        where: { levelId },
        data: { requirement: data.requirement, note: data.note },
    });

    if (newPos !== marks.position) {
        const list = await actualNumber();
        const where = list.indexOf(levelId);

        list.splice(where, 1);
        list.splice(Math.min(newPos - 1, list.length), 0, levelId);

        await renumber(list);
    }

    updateSite();
    redirect('/admin/ranking');
}
export async function move(levelId: number, pose: 'вверх' | 'вниз') {
    await checkAllow();

    const number = await actualNumber();
    const where = number.indexOf(levelId);
    if (where === -1) return;

    const path = pose === 'вверх' ? where - 1 : where + 1;
    if (path < 0 || path >= number.length) return;

    [number[where], number[path]] = [number[path], number[where]];

    await renumber(number);
    updateSite();
}

export async function deleteLevel(levelId: number) {
    await checkAllow();

    await prisma.communityRank.delete({ where: { levelId } });
    await renumber(await actualNumber());

    updateSite();
}
