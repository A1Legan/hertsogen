'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/src/lib/prisma';

/**
 * Обновление своего прогресса по личной ссылке.
 *
 * Здесь нет входа и пароля: ключ в адресе и есть пропуск. Кто знает
 * ссылку — тот может менять эту одну запись, и больше ничего.
 *
 * Такой подход называют «ключ вместо учётной записи». Он уместен, когда
 * заводить аккаунт ради одного действия дороже, чем оно стоит: стример
 * меняет число раз в час со своего телефона, и заставлять его помнить
 * пароль от чужого сайта — верный способ, чтобы он этого не делал.
 *
 * Границы риска: чужой человек с украденной ссылкой испортит один процент
 * у одного стрима. Это видно, чинится за секунду и ключ можно сменить.
 */

const Форма = z.object({
    progress: z.coerce
        .number()
        .int('Процент — целое число')
        .min(0, 'Меньше нуля не бывает')
        .max(100, 'Больше 100% не бывает'),

    levelName: z.string().trim().min(1, 'Укажите уровень').max(150),
});

export type СостояниеОбновления = { ошибка?: string; сохранено?: boolean } | undefined;

export async function обновитьСвойПрогресс(
    token: string,
    _прошлое: СостояниеОбновления,
    form: FormData,
): Promise<СостояниеОбновления> {
    const стрим = await prisma.stream.findUnique({ where: { updateToken: token } });

    // Ключ не подошёл. Ответ такой же, как при неверных данных —
    // чтобы по разнице ответов нельзя было перебирать ключи
    if (!стрим) return { ошибка: 'Ссылка недействительна' };

    const разбор = Форма.safeParse({
        progress: form.get('progress'),
        levelName: form.get('levelName'),
    });

    if (!разбор.success) {
        return { ошибка: разбор.error.issues[0]?.message ?? 'Проверьте поля' };
    }

    await prisma.stream.update({
        where: { id: стрим.id },
        data: разбор.data,
    });

    revalidatePath('/streams');
    revalidatePath('/');

    return { сохранено: true };
}
