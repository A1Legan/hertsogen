import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

/**
 * Хранилище картинок.
 *
 * Написано под протокол S3 — его понимают почти все: Яндекс Object Storage,
 * Selectel, VK Cloud, Cloud.ru, Timeweb Cloud, а также Amazon и Cloudflare R2.
 * Сменить поставщика = поменять переменные в .env, код не трогается.
 *
 * Почему не пишем файлы в public/: на Vercel и на большинстве современных
 * хостингов файловая система только для чтения и живёт до конца запроса.
 * Файл, записанный при загрузке, исчезнет, а на соседнем сервере его
 * не будет вовсе. Локально это работает и потому особенно коварно.
 */

const ENDPOINT = process.env.S3_ENDPOINT;
const BUCKET = process.env.S3_BUCKET;
const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID;
const SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY;
const REGION = process.env.S3_REGION ?? 'ru-central1';

/** Адрес, по которому файлы видны в интернете. */
const PUBLIC_URL = process.env.S3_PUBLIC_URL;

/** Настроено ли хранилище. Если нет — загрузка просто недоступна. */
export function хранилищеНастроено(): boolean {
    return Boolean(ENDPOINT && BUCKET && ACCESS_KEY && SECRET_KEY && PUBLIC_URL);
}

function клиент() {
    if (!хранилищеНастроено()) {
        throw new Error(
            'Хранилище не настроено. Нужны S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, ' +
                'S3_SECRET_ACCESS_KEY и S3_PUBLIC_URL в переменных окружения.',
        );
    }

    return new S3Client({
        region: REGION,
        endpoint: ENDPOINT,
        credentials: { accessKeyId: ACCESS_KEY!, secretAccessKey: SECRET_KEY! },

        // Большинство не-амазоновских хранилищ адресуют бакет через путь
        // (endpoint/bucket/file), а не через поддомен. Без этого флага
        // запросы уходят не туда.
        forcePathStyle: true,
    });
}

/* ------------------------------------------------------------------ *
 * ПРОВЕРКА ФАЙЛА
 * ------------------------------------------------------------------ */

const РАЗРЕШЁННЫЕ_ТИПЫ: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

const МАКСИМУМ_БАЙТ = 5 * 1024 * 1024; // 5 МБ

export type РезультатПроверки = { ок: true; расширение: string } | { ок: false; причина: string };

/**
 * Проверка загружаемого файла.
 *
 * Заметь: тип файла мы берём из того, что прислал браузер, а это можно
 * подделать. Для админки, куда заходят два человека по белому списку почт,
 * этого достаточно — соразмерно риску.
 *
 * Если когда-нибудь загрузку откроют посторонним (например, к заявкам
 * на рекорд), проверку надо усилить: читать первые байты файла и сверять
 * с настоящей сигнатурой формата. Расширение и заголовок там доверия
 * не заслуживают.
 */
export function проверитьФайл(file: File): РезультатПроверки {
    if (file.size === 0) {
        return { ок: false, причина: 'Файл пустой' };
    }

    if (file.size > МАКСИМУМ_БАЙТ) {
        const мб = (file.size / 1024 / 1024).toFixed(1);
        return { ок: false, причина: `Файл ${мб} МБ, а можно не больше 5 МБ` };
    }

    const расширение = РАЗРЕШЁННЫЕ_ТИПЫ[file.type];
    if (!расширение) {
        return { ок: false, причина: 'Годятся только картинки: JPG, PNG, WebP или GIF' };
    }

    return { ок: true, расширение };
}

/* ------------------------------------------------------------------ *
 * ЗАГРУЗКА И УДАЛЕНИЕ
 * ------------------------------------------------------------------ */

/**
 * Кладёт файл в хранилище и возвращает адрес, по которому он доступен.
 *
 * Имя файла придумываем сами, а не берём у пользователя: в присланном
 * имени может оказаться что угодно — путь с ../, кириллица, пробелы,
 * совпадение с уже existing файлом. Случайный идентификатор снимает
 * все эти вопросы разом.
 */
export async function загрузитьКартинку(file: File, папка = 'news'): Promise<string> {
    const проверка = проверитьФайл(file);
    if (!проверка.ок) throw new Error(проверка.причина);

    const ключ = `${папка}/${randomUUID()}.${проверка.расширение}`;
    const байты = new Uint8Array(await file.arrayBuffer());

    await клиент().send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: ключ,
            Body: байты,
            ContentType: file.type,

            // Год в кэше: файл никогда не меняется, у нового будет новое имя
            CacheControl: 'public, max-age=31536000, immutable',
        }),
    );

    return `${PUBLIC_URL!.replace(/\/$/, '')}/${ключ}`;
}

/**
 * Удаляет файл по его публичному адресу.
 *
 * Не бросает ошибку при неудаче: если старая картинка не удалилась,
 * это мусор в хранилище на пару килобайт, а не повод отменять сохранение
 * новости. Ошибку пишем в лог и живём дальше.
 */
export async function удалитьКартинку(url: string | null): Promise<void> {
    if (!url || !PUBLIC_URL || !url.startsWith(PUBLIC_URL)) return;

    const ключ = url.slice(PUBLIC_URL.replace(/\/$/, '').length + 1);
    if (!ключ) return;

    try {
        await клиент().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: ключ }));
    } catch (err) {
        console.error('Не удалось удалить картинку из хранилища:', ключ, err);
    }
}
