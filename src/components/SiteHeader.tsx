'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Верхняя навигация. Липкая, как в прототипе.
 *
 * Клиентский компонент ('use client' сверху) — потому что следит за
 * прокруткой. Всё, что реагирует на действия пользователя в браузере,
 * обязано быть клиентским: на сервере ни скролла, ни мыши не существует.
 *
 * Логотип выезжает слева, когда страница прокручена вниз — эффект из
 * старого сайта.
 */

const ПУНКТЫ = [
    { href: '/levels', label: 'Levels' },
    { href: '/players', label: 'Players' },
    { href: '/news', label: 'News' },
    { href: '/streams', label: 'Streams' },
];

export function SiteHeader() {
    const [прокручено, setПрокручено] = useState(false);

    useEffect(() => {
        const onScroll = () => setПрокручено(window.scrollY > 100);

        onScroll(); // проверить сразу: страницу могли открыть уже прокрученной
        window.addEventListener('scroll', onScroll, { passive: true });

        // Убрать слушатель, когда компонент исчезает, иначе они копятся
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className="sticky top-0 z-50 h-20 w-full border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-full w-full max-w-[1350px] items-stretch justify-center px-2 sm:px-4">
                <div
                    className={`flex-none overflow-hidden transition-all duration-500 ease-in-out ${
                        прокручено ? 'w-16 opacity-100 sm:w-24' : 'w-0 opacity-0'
                    }`}
                >
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex h-full items-center justify-center px-2 sm:px-4"
                        aria-label="Наверх"
                    >
                        {/*
                            Обычный img, а не next/image: логотип лежит в
                            контейнере, который анимирует ширину от нуля, и
                            вычисленный размер никогда не совпадёт с заявленным —
                            Next будет ругаться всегда. Оптимизировать тут нечего,
                            картинка своя и крошечная.
                        */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="" className="h-12 w-auto sm:h-16" />
                    </button>
                </div>

                <nav className="flex h-full items-stretch overflow-x-auto whitespace-nowrap text-xs font-bold uppercase text-gray-800 sm:text-sm">
                    {ПУНКТЫ.map((п) => (
                        <Link
                            key={п.href}
                            href={п.href}
                            className="flex items-center border-l border-gray-200 px-4 transition-colors last:border-r hover:bg-orange-100 hover:text-orange-600 sm:px-8"
                        >
                            {п.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
