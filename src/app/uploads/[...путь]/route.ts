import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathPicture } from '@/src/lib/storage';

const TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ way: string[] }> },
) {
    const { way } = await params;

    const file = pathPicture(way);
    if (!file) return new Response('Не найдено', { status: 404 });

    const type = TYPES[way.extname(file).toLowerCase()];
    if (!type) return new Response('Не найдено', { status: 404 });

    try {
        const data = await readFile(file);

        return new Response(new Uint8Array(data), {
            headers: {
                'Content-Type': type,

                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return new Response('Не найдено', { status: 404 });
    }
}
