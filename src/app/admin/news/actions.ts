'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';

/**
 * Действия над новостями.
 *
 * ВАЖНОЕ ПРО БЕЗОПАСНОСТЬ.
 *
 * 'use server' превращает каждую функцию отсюда в обычный сетевой адрес,
 * на который можно послать запрос напрямую — курлом, из консоли браузера,
 * откуда угодно. Middleware такой запрос не остановит: он охраняет страницы,
 * а не действия.
 *
 * Поэтому КАЖДОЕ действие само проверяет вход. Не «на всякий случай»,
 * а потому что это единственная настоящая защита. Всё, что в интерфейсе,
 * — только удобство: кнопку можно не нажимать, а запрос всё равно послать.
 */

async function проверитьДоступ() {
    const сессия = await auth();

    if (!сессия?.user?.email) {
        throw new Error('Нет доступа');
    }

    return сессия.user.email;
}

/**
 * Схема формы. Данные из формы приходят строками — всё, что ввёл человек,
 * это текст, даже если в поле стояла дата или галочка.
 */
const ФормаНовости = z.object({
    title: z.string().trim().min(1, 'Заголовок обязателен').max(200),
    category: z.string().trim().min(1).max(50),
    date: z.string().min(1, 'Дата обязательна'),
    text: z.string().trim().min(1, 'Текст обязателен'),
    image: z.string().trim().max(300).nullable(),
    published: z.boolean(),
});

function разобратьФорму(form: FormData) {
    const картинка = String(form.get('image') ?? '').trim();

    return ФормаНовости.parse({
        title: form.get('title'),
        category: form.get('category'),
        date: form.get('date'),
        text: form.get('text'),
        // Пустое поле — это отсутствие картинки, а не пустая строка
        image: картинка === '' ? null : картинка,
        // Невыбранная галочка не приходит в форме вообще
        published: form.get('published') === 'on',
    });
}

/** Обновить страницы сайта, которые показывают новости. */
function обновитьСайт() {
    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath('/admin/news');
}

export async function создатьНовость(form: FormData) {
    await проверитьДоступ();

    const данные = разобратьФорму(form);

    await prisma.news.create({
        data: { ...данные, date: new Date(данные.date) },
    });

    обновитьСайт();
    redirect('/admin/news');
}

export async function обновитьНовость(id: string, form: FormData) {
    await проверитьДоступ();

    const данные = разобратьФорму(form);

    await prisma.news.update({
        where: { id },
        data: { ...данные, date: new Date(данные.date) },
    });

    обновитьСайт();
    redirect('/admin/news');
}

export async function удалитьНовость(id: string) {
    await проверитьДоступ();

    await prisma.news.delete({ where: { id } });

    обновитьСайт();
}

/** Быстрое переключение «опубликовано / черновик» прямо из списка. */
export async function переключитьПубликацию(id: string) {
    await проверитьДоступ();

    const новость = await prisma.news.findUnique({ where: { id } });
    if (!новость) return;

    await prisma.news.update({
        where: { id },
        data: { published: !новость.published },
    });

    обновитьСайт();
}
