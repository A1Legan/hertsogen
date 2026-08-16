'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * Поле поиска над списком.
 *
 * Запрос живёт в АДРЕСЕ (?q=...), а не в состоянии компонента. Из-за этого
 * найденное можно скинуть ссылкой, кнопка «назад» работает как ожидается,
 * а сама фильтрация происходит на сервере — списку не нужно приезжать
 * в браузер целиком.
 *
 * Печатаем мы быстрее, чем отвечает сервер, поэтому адрес меняется не на
 * каждую букву, а спустя 300 мс после последней. Иначе на слово из семи
 * букв ушло бы семь запросов, из которых нужен только последний.
 */
export function SearchBox({
    placeholder,
    подпись,
}: {
    placeholder: string;
    /** Что читает вслух программа для незрячих: «Поиск уровней» и т.п. */
    подпись: string;
}) {
    const параметры = useSearchParams();
    const путь = usePathname();
    const роутер = useRouter();

    const [текст, setТекст] = useState(параметры.get('q') ?? '');
    const [идётЗагрузка, начать] = useTransition();

    useEffect(() => {
        const вАдресе = параметры.get('q') ?? '';
        if (текст === вАдресе) return; // ничего не изменилось

        const таймер = setTimeout(() => {
            const новые = new URLSearchParams(параметры);

            if (текст.trim()) новые.set('q', текст.trim());
            else новые.delete('q');

            // Показ «ещё» сбрасываем: при новом запросе он бессмыслен,
            // а оставшийся в адресе заставил бы грузить лишние страницы
            новые.delete('n');

            начать(() => {
                // replace, а не push: иначе каждая буква оставила бы
                // запись в истории, и «назад» пришлось бы жать раз двадцать
                роутер.replace(`${путь}?${новые}`, { scroll: false });
            });
        }, 300);

        return () => clearTimeout(таймер);
    }, [текст, параметры, путь, роутер]);

    return (
        <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />

            <input
                type="search"
                value={текст}
                onChange={(e) => setТекст(e.target.value)}
                placeholder={placeholder}
                aria-label={подпись}
                className="w-full border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm focus:border-orange-500 focus:outline-none"
            />

            {идётЗагрузка ? (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
            ) : (
                текст && (
                    <button
                        type="button"
                        onClick={() => setТекст('')}
                        aria-label="Очистить поиск"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                    >
                        <X className="size-4" />
                    </button>
                )
            )}
        </div>
    );
}
