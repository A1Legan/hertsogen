'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { загрузитьКартинку, удалитьКартинку, хранилищеНастроено } from '@/src/lib/storage';

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

/** Поля формы, кроме картинки — она обрабатывается отдельно. */
const ФормаНовости = z.object({
    title: z.string().trim().min(1, 'Заголовок обязателен').max(200),
    category: z.string().trim().min(1).max(50),
    date: z.string().min(1, 'Дата обязательна'),
    text: z.string().trim().min(1, 'Текст обязателен'),
    published: z.boolean(),
});

function разобратьФорму(form: FormData) {
    return ФормаНовости.parse({
        title: form.get('title'),
        category: form.get('category'),
        date: form.get('date'),
        text: form.get('text'),
        // Невыбранная галочка не приходит в форме вообще
        published: form.get('published') === 'on',
    });
}

/**
 * Что делать с картинкой.
 *
 * Три случая, и их надо различать:
 *  — выбрали новый файл          -> загрузить, вернуть новый адрес
 *  — нажали «убрать картинку»    -> вернуть null
 *  — не трогали                  -> оставить как было
 *
 * Без третьего случая правка заголовка молча стирала бы картинку.
 */
async function разобратьКартинку(
    form: FormData,
    текущая: string | null,
): Promise<string | null> {
    if (form.get('удалитьКартинку') === 'on') {
        await удалитьКартинку(текущая);
        return null;
    }

    const файл = form.get('картинка');

    // Пустой input type=file присылает File с нулевым размером
    if (!(файл instanceof File) || файл.size === 0) {
        return текущая;
    }

    if (!хранилищеНастроено()) {
        throw new Error('Хранилище картинок не настроено — загрузка недоступна');
    }

    const новая = await загрузитьКартинку(файл, 'news');

    // Старая больше не нужна. Удаляем после успешной загрузки, а не до:
    // если загрузка упадёт, лучше остаться со старой картинкой, чем без обеих.
    await удалитьКартинку(текущая);

    return новая;
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
    const image = await разобратьКартинку(form, null);

    await prisma.news.create({
        data: { ...данные, image, date: new Date(данные.date) },
    });

    обновитьСайт();
    redirect('/admin/news');
}

export async function обновитьНовость(id: string, form: FormData) {
    await проверитьДоступ();

    const прежняя = await prisma.news.findUnique({ where: { id } });
    if (!прежняя) throw new Error('Новость не найдена');

    const данные = разобратьФорму(form);
    const image = await разобратьКартинку(form, прежняя.image);

    await prisma.news.update({
        where: { id },
        data: { ...данные, image, date: new Date(данные.date) },
    });

    обновитьСайт();
    redirect('/admin/news');
}

export async function удалитьНовость(id: string) {
    await проверитьДоступ();

    const новость = await prisma.news.findUnique({ where: { id } });

    await prisma.news.delete({ where: { id } });

    // Картинку убираем следом, чтобы не копить мусор в хранилище
    await удалитьКартинку(новость?.image ?? null);

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
