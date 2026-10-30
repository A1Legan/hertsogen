import { revalidatePath } from 'next/cache';
import { updateLive } from '@/src/lib/live';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const key = process.env.CRON_SECRET;

    if (!key) {
        return Response.json(
            { error: 'CRON_SECRET не задан — обновление отключено' },
            { status: 503 },
        );
    }

    const fromTitle = req.headers.get('authorization');
    const fromAddress = new URL(req.url).searchParams.get('key');

    const my = fromTitle === `Bearer ${key}` || fromAddress === key;

    if (!my) {

        return Response.json({ error: 'Нет доступа' }, { status: 401 });
    }

    try {
        const итог = await updateLive();

        revalidatePath('/streams');
        revalidatePath('/');

        return Response.json({ ок: true, ...итог });
    } catch (err) {
        console.error('Не удалось обновить эфиры:', err);
        return Response.json(
            { ошибка: err instanceof Error ? err.message : 'Неизвестная ошибка' },
            { status: 500 },
        );
    }
}
