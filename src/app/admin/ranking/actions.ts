'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { getLevels } from '@/src/lib/demonlist';

/**
 * Действия над собственным рейтингом.
 *
 * Как и в новостях: 'use server' делает каждую функцию сетевым адресом,
 * который можно дёрнуть напрямую, минуя форму и минуя middleware.
 * Поэтому проверка входа стоит в каждой, а не один раз где-то в layout.
 *
 * ПРО ПОЗИЦИИ. В базе они всегда идут подряд: 1, 2, 3, ... N. Дырок нет,
 * повторов нет. Это удерживается тут, а не в базе, потому что уникальный
 * индекс на позицию сделал бы перестановку невозможной: при обмене двух
 * уровней местами любой порядок записи на мгновение создаёт повтор,
 * и база ругнулась бы посреди операции.
 *
 * Взамен каждая операция, меняющая порядок, перенумеровывает список
 * целиком. Для полусотни уровней это одна короткая транзакция.
 */

async function проверитьДоступ() {
    const сессия = await auth();

    if (!сессия?.user?.email) {
        throw new Error('Нет доступа');
    }

    return сессия.user.email;
}

function обновитьСайт() {
    revalidatePath('/levels/community');
    revalidatePath('/admin/ranking');
    revalidatePath('/admin');
}

/**
 * Поля, общие для добавления и правки.
 *
 * levelId сюда НЕ входит. При добавлении он приходит из формы, при правке
 * берётся из адреса страницы и подставляется через bind — в форме его нет
 * вовсе, чтобы нельзя было подменить и отредактировать чужую запись.
 */
const Форма = z.object({
    requirement: z.coerce.number().int().min(1).max(100),
    note: z
        .string()
        .trim()
        .max(500)
        // Пустое поле формы приходит пустой строкой, а в базе такому
        // место null: «примечания нет» и «примечание из нуля символов»
        // должны выглядеть одинаково
        .transform((s) => s || null),
});

function разобратьФорму(form: FormData) {
    return Форма.parse({
        requirement: form.get('requirement'),
        note: form.get('note') ?? '',
    });
}

const IdУровня = z.coerce
    .number({ message: 'Уровень не выбран' })
    .int()
    .positive('Уровень не выбран');

/**
 * Существует ли такой уровень в Global Demonlist.
 *
 * LevelPicker не даёт выбрать несуществующий, но проверка всё равно нужна:
 * действие вызывается по сети напрямую, и что там было в интерфейсе,
 * серверу неизвестно.
 *
 * Без этой проверки запись сохранилась бы, а на сайте не появилась —
 * getCommunityRanking() молча пропускает уровни, которых нет в источнике.
 * Пропажа без ошибки хуже понятного отказа: искать её будешь долго.
 */
async function проверитьУровень(levelId: number) {
    const уровни = await getLevels();

    if (!уровни.some((l) => l.id === levelId)) {
        throw new Error(
            `Уровня с id ${levelId} нет в списке Global Demonlist. ` +
                'Выберите уровень через поиск по названию.',
        );
    }
}

/** Записать позиции 1..N в порядке переданных id. */
async function перенумеровать(порядок: number[]) {
    await prisma.$transaction(
        порядок.map((levelId, индекс) =>
            prisma.communityRank.update({
                where: { levelId },
                data: { position: индекс + 1 },
            }),
        ),
    );
}

async function текущийПорядок(): Promise<number[]> {
    const записи = await prisma.communityRank.findMany({
        orderBy: { position: 'asc' },
        select: { levelId: true },
    });

    return записи.map((з) => з.levelId);
}

/** Добавить уровень в конец списка. */
export async function добавитьУровень(form: FormData) {
    await проверитьДоступ();

    const данные = разобратьФорму(form);
    const levelId = IdУровня.parse(form.get('levelId'));

    await проверитьУровень(levelId);

    const уже = await prisma.communityRank.findUnique({ where: { levelId } });

    // Ловим сами, а не отдаём Prisma упасть с P2002: её сообщение
    // про нарушение уникальности человеку ничего не объясняет
    if (уже) {
        throw new Error('Этот уровень уже есть в списке — найдите его и поправьте.');
    }

    const всего = await prisma.communityRank.count();

    await prisma.communityRank.create({
        data: { ...данные, levelId, position: всего + 1 },
    });

    обновитьСайт();
    redirect('/admin/ranking');
}

/**
 * Изменить требование, примечание и место.
 *
 * Сам уровень не меняется: levelId — первичный ключ, и «поменять уровень»
 * означало бы удалить запись и создать другую. Проще выбрать нужный
 * заново, чем городить это внутри правки.
 */
export async function обновитьУровень(levelId: number, form: FormData) {
    await проверитьДоступ();

    const данные = разобратьФорму(form);
    const новаяПозиция = z.coerce.number().int().min(1).parse(form.get('position'));

    const запись = await prisma.communityRank.findUnique({ where: { levelId } });
    if (!запись) throw new Error('Записи нет — возможно, её уже удалили');

    await prisma.communityRank.update({
        where: { levelId },
        data: { requirement: данные.requirement, note: данные.note },
    });

    // Порядок трогаем отдельно и только если он правда изменился
    if (новаяПозиция !== запись.position) {
        const порядок = await текущийПорядок();
        const откуда = порядок.indexOf(levelId);

        порядок.splice(откуда, 1);
        // Больше длины списка вписать нельзя — уедет в конец, и это
        // ровно то, чего человек и хотел, вписав число побольше
        порядок.splice(Math.min(новаяПозиция - 1, порядок.length), 0, levelId);

        await перенумеровать(порядок);
    }

    обновитьСайт();
    redirect('/admin/ranking');
}

/** Сдвинуть на одну строку вверх или вниз — кнопками из списка. */
export async function сдвинуть(levelId: number, направление: 'вверх' | 'вниз') {
    await проверитьДоступ();

    const порядок = await текущийПорядок();
    const откуда = порядок.indexOf(levelId);
    if (откуда === -1) return;

    const куда = направление === 'вверх' ? откуда - 1 : откуда + 1;

    // Край списка — тихо ничего не делаем. Кнопка там и так не показана,
    // а падать из-за повторного нажатия незачем
    if (куда < 0 || куда >= порядок.length) return;

    [порядок[откуда], порядок[куда]] = [порядок[куда], порядок[откуда]];

    await перенумеровать(порядок);
    обновитьСайт();
}

/** Убрать уровень и сомкнуть список, чтобы не осталось дырки в нумерации. */
export async function удалитьУровень(levelId: number) {
    await проверитьДоступ();

    await prisma.communityRank.delete({ where: { levelId } });
    await перенумеровать(await текущийПорядок());

    обновитьСайт();
}
