import Link from 'next/link';

/**
 * Верхняя навигация. Липкая, как в прототипе.
 *
 * В старом сайте эта разметка была скопирована в каждый из восьми
 * html-файлов. Теперь она здесь одна, и правка меню правится в одном месте.
 */

const ПУНКТЫ = [
    { href: '/levels', label: 'Levels' },
    { href: '/players', label: 'Players' },
    { href: '/news', label: 'News' },
    { href: '/streams', label: 'Streams' },
];

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 h-20 w-full border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-full w-full max-w-[1350px] items-stretch justify-center px-2 sm:px-4">
                <Link
                    href="/"
                    className="flex flex-none items-center px-3 text-lg font-black tracking-tight text-gray-900 sm:px-5"
                >
                    H<span className="text-orange-600">&amp;</span>CR
                </Link>

                <nav className="flex h-full items-stretch overflow-x-auto whitespace-nowrap text-xs font-bold uppercase text-gray-800 sm:text-sm">
                    {ПУНКТЫ.map((п) => (
                        <Link
                            key={п.href}
                            href={п.href}
                            className="flex items-center border-l border-gray-200 px-4 transition-colors hover:bg-orange-100 hover:text-orange-600 last:border-r sm:px-8"
                        >
                            {п.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
