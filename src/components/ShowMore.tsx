'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Кнопка «показать ещё».
 *
 * Это ссылка, а не кнопка со скриптом. Сколько записей показывать, записано
 * в адресе (?n=300), поэтому страница с открытой половиной списка
 * скидывается ссылкой и переживает обновление вкладки.
 *
 * scroll={false} обязателен: без него Next после перехода уводит наверх,
 * и человек, дочитавший до низа, окажется в начале списка.
 */
export function ShowMore({
    показано,
    естьЕщё,
    шаг,
    единицы,
}: {
    показано: number;
    /**
     * Есть ли что показывать дальше.
     *
     * Именно признак, а не общее число. Для уровней общее известно — весь
     * список у нас на руках. А для игроков нет: их ~12726, и чтобы узнать
     * точное количество, пришлось бы выкачать 255 страниц ради одной цифры.
     */
    естьЕщё: boolean;
    /** На сколько прибавляем за одно нажатие */
    шаг: number;
    /** Родительный падеж: «уровней», «игроков» */
    единицы: string;
}) {
    const параметры = useSearchParams();
    const путь = usePathname();

    if (!естьЕщё) {
        return (
            <p className="py-6 text-center text-sm text-gray-500">
                Это всё — {показано} {единицы}
            </p>
        );
    }

    const новые = new URLSearchParams(параметры);
    новые.set('n', String(показано + шаг));

    return (
        <div className="py-6 text-center">
            <Link
                href={`${путь}?${новые}`}
                scroll={false}
                className="inline-block border border-gray-300 bg-white px-8 py-3 text-sm font-bold uppercase text-gray-700 transition-colors hover:border-orange-500 hover:text-orange-600"
            >
                Показать ещё
            </Link>
            <p className="mt-2 text-xs text-gray-500">
                Показано {показано} {единицы}
            </p>
        </div>
    );
}
