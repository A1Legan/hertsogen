import { revalidatePath } from 'next/cache';
import { обновитьЭфиры } from '@/src/lib/live';

/**
 * Обновление статуса эфиров по расписанию.
 *
 * Дёргается снаружи — планировщиком Vercel, cron на сервере или чем угодно,
 * что умеет раз в несколько минут открыть адрес.
 *
 * ЗАЩИТА. Это единственный адрес, который меняет данные и при этом не
 * закрыт входом: планировщик не умеет логиниться через Google. Поэтому
 * доступ по секретному ключу из переменной окружения.
 *
 * Без ключа адрес мог бы дёрнуть кто угодно, сколько угодно раз, — и мы
 * выжгли бы квоту YouTube за минуту, а Twitch забанил бы нас за частоту.
 * Данные при этом не пострадали бы, но сервис перестал бы работать.
 */

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const ключ = process.env.CRON_SECRET;

    if (!ключ) {
        return Response.json(
            { ошибка: 'CRON_SECRET не задан — обновление отключено' },
            { status: 503 },
        );
    }

    // Принимаем ключ и в заголовке (так шлёт планировщик Vercel),
    // и параметром в адресе (так проще настроить обычный cron)
    const изЗаголовка = req.headers.get('authorization');
    const изАдреса = new URL(req.url).searchParams.get('key');

    const свой = изЗаголовка === `Bearer ${ключ}` || изАдреса === ключ;

    if (!свой) {
        // Намеренно без подробностей: чужому незачем знать,
        // ошибся он в ключе или адрес вообще не тот
        return Response.json({ ошибка: 'Нет доступа' }, { status: 401 });
    }

    try {
        const итог = await обновитьЭфиры();

        // Страницы со стримами должны показать новое сразу,
        // а не через минуту кэша
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
