import Link from 'next/link';

export function RatingTabs({ active }: { active: 'global' | 'community' }) {
    const tabs = [
        { key: 'global', href: '/levels', label: 'demonlist.org rating' },
        { key: 'community', href: '/levels/community', label: 'Hertzogen and community rating' },
    ] as const;

    return (
        <div className="flex flex-col justify-center border-b border-gray-300 bg-gray-50 sm:flex-row">
            {tabs.map((в) => (
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
