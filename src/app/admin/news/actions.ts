'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { uploadPicture, deletePicture, dataMake } from '@/src/lib/storage';

async function checkAllow() {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error('Нет доступа');
    }

    return session.user.email;
}

const NewsForm = z.object({
    title: z.string().trim().min(1, 'Заголовок обязателен').max(200),
    category: z.string().trim().min(1).max(50),
    date: z.string().min(1, 'Дата обязательна'),
    text: z.string().trim().min(1, 'Текст обязателен'),
    published: z.boolean(),
});

function checkForm(form: FormData) {
    return NewsForm.parse({
        title: form.get('title'),
        category: form.get('category'),
        date: form.get('date'),
        text: form.get('text'),
        // Невыбранная галочка не приходит в форме вообще
        published: form.get('published') === 'on',
    });
}

async function checkImage(
    form: FormData,
    now: string | null,
): Promise<string | null> {
    if (form.get('удалитьКартинку') === 'on') {
        await deletePicture(now);
        return null;
    }

    const file = form.get('картинка');

    if (!(file instanceof File) || file.size === 0) {
        return now;
    }

    if (!dataMake()) {
        throw new Error('Хранилище картинок не настроено — загрузка недоступна');
    }

    const newNew = await uploadPicture(file, 'news');

    await deletePicture(now);

    return newNew;
}

function updateSite() {
    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath('/admin/news');
}

export async function createNews(form: FormData) {
    await checkAllow();

    const data = checkForm(form);
    const image = await checkImage(form, null);

    await prisma.news.create({
        data: { ...data, image, date: new Date(data.date) },
    });

    updateSite();
    redirect('/admin/news');
}

export async function updateNews(id: string, form: FormData) {
    await checkAllow();

    const before = await prisma.news.findUnique({ where: { id } });
    if (!before) throw new Error('Новость не найдена');

    const data = checkForm(form);
    const image = await checkImage(form, before.image);

    await prisma.news.update({
        where: { id },
        data: { ...data, image, date: new Date(data.date) },
    });

    updateSite();
    redirect('/admin/news');
}

export async function deleteNews(id: string) {
    await checkAllow();

    const новость = await prisma.news.findUnique({ where: { id } });

    await prisma.news.delete({ where: { id } });

    await deletePicture(новость?.image ?? null);

    updateSite();
}

export async function changePost(id: string) {
    await checkAllow();

    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) return;

    await prisma.news.update({
        where: { id },
        data: { published: !news.published },
    });

    updateSite();
}
