import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
const FOLDER = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');

const PREFICS = '/uploads';

export function dataMake(): boolean {
    return true;
}
const ALLOWED_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

const MAX_BYTES = 5 * 1024 * 1024;

export type resultCheck = { ok: true; extension: string } | { ok: false; reason: string };

export function checkFile(file: File): resultCheck {
    if (file.size === 0) {
        return { ok: false, reason: 'Файл пустой' };
    }

    if (file.size > MAX_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        return { ok: false, reason: `Файл ${mb} МБ, а можно не больше 5 МБ` };
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
        return { ok: false, reason: 'Годятся только картинки: JPG, PNG, WebP или GIF' };
    }

    return { ok: true, extension: extension };
}

export async function uploadPicture(file: File, folder = 'news'): Promise<string> {
    const check = checkFile(file);
    if (!check.ok) throw new Error(check.reason);

    const имя = `${randomUUID()}.${check.extension}`;
    const where = path.join(FOLDER, folder);

    await mkdir(where, { recursive: true });

    const байты = new Uint8Array(await file.arrayBuffer());
    await writeFile(path.join(where, имя), байты);

    return `${PREFICS}/${folder}/${имя}`;
}

function pathToFile(url: string): string | null {
    if (!url.startsWith(`${PREFICS}/`)) return null;

    const relative = url.slice(PREFICS.length + 1);
    const full = path.resolve(FOLDER, relative);

    const root = path.resolve(FOLDER);
    if (!full.startsWith(root + path.sep)) return null;

    return full;
}

export function pathPicture(addressPart: string[]): string | null {
    return pathToFile(`${PREFICS}/${addressPart.join('/')}`);
}

export async function deletePicture(url: string | null): Promise<void> {
    if (!url) return;

    const file = pathToFile(url);
    if (!file) return;

    try {
        await unlink(file);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error('Не удалось удалить картинку:', file, err);
        }
    }
}
