import Link from 'next/link';

/**
 * Переключатель двух рейтингов — как в старом top.html.
 *
 * Отличие от оригинала: там вкладки переключались скриптом, и на вторую
 * нельзя было дать ссылку — адрес не менялся. Здесь это два разных адреса,
 * поэтому ссылку можно кинуть другу, а поисковик видит обе страницы.
 */
export function RatingTabs({ active }: { active: 'global' | 'community' }) {
    const вкладки = [
        { key: 'global', href: '/levels', label: 'demonlist.org rating' },
        { key: 'community', href: '/levels/community', label: 'Hertzogen and community rating' },
    ] as const;

    return (
        <div className="flex flex-col justify-center border-b border-gray-300 bg-gray-50 sm:flex-row">
            {вкладки.map((в) => (
                <Link
                    key={в.key}
                    href={в.href}
                    className={`flex-1 border-b-2 px-4 py-3 text-center text-[11px] font-bold uppercase transition-colors sm:text-xs md:text-sm ${
                        active === в.key
                            ? 'border-orange-500 bg-white text-orange-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                    {в.label}
                </Link>
            ))}
        </div>
    );
}
