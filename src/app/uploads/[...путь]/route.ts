import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { путьКартинки } from '@/src/lib/storage';

/**
 * Отдача загруженных картинок.
 *
 * Почему не положить их в public/: содержимое public попадает в сборку,
 * а картинки появляются после неё. Файл, добавленный позже, там уже
 * не появится — и новость окажется без картинки.
 *
 * Поэтому отдаём своим обработчиком. Работает одинаково и на сервере,
 * и локально при разработке — одна дорога вместо двух.
 *
 * Когда картинок станет много, отдачу можно передать nginx: он умеет
 * это заметно эффективнее, чем Node. Пока не с чего — их единицы.
 */

const ТИПЫ: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ путь: string[] }> },
) {
    const { путь } = await params;

    // Внутри проверяется, что адрес не уводит за пределы папки
    const файл = путьКартинки(путь);
    if (!файл) return new Response('Не найдено', { status: 404 });

    const тип = ТИПЫ[path.extname(файл).toLowerCase()];
    if (!тип) return new Response('Не найдено', { status: 404 });

    try {
        const данные = await readFile(файл);

        return new Response(new Uint8Array(данные), {
            headers: {
                'Content-Type': тип,

                // Год в кэше: файл никогда не меняется, у изменённой
                // картинки будет новое случайное имя
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return new Response('Не найдено', { status: 404 });
    }
}
