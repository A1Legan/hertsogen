'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/src/lib/prisma';

const Form = z.object({
    progress: z.coerce
        .number()
        .int('Процент — целое число')
        .min(0, 'Меньше нуля не бывает')
        .max(100, 'Больше 100% не бывает'),

    levelName: z.string().trim().min(1, 'Укажите уровень').max(150),
});

export type checkUpdate = { error?: string; saved?: boolean } | undefined;

export async function updateYourProgress(
    token: string,
    _before: checkUpdate,
    form: FormData,
): Promise<checkUpdate> {
    const live = await prisma.stream.findUnique({ where: { updateToken: token } });

    if (!live) return { error: 'Ссылка недействительна' };

    const check = Form.safeParse({
        progress: form.get('progress'),
        levelName: form.get('levelName'),
    });

    if (!check.success) {
        return { error: check.error.issues[0]?.message ?? 'Проверьте поля' };
    }

    await prisma.stream.update({
        where: { id: live.id },
        data: check.data,
    });

    revalidatePath('/streams');
    revalidatePath('/');

    return { saved: true };
}
