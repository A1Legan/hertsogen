import { SidebarTopPlayers, SidebarTopLevels, SidebarStreams, SidebarNews } from './Sidebars';

/**
 * Трёхколоночный каркас из прототипа: боковые блоки слева и справа,
 * контент посередине, чёрный фон по краям.
 *
 * Всё, что странице нужно сделать, — обернуть себя в <Shell>.
 * Боковые колонки данные берут сами.
 */
export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full justify-center gap-x-4 bg-black xl:gap-x-12">
            <div className="w-full max-w-[1350px] bg-gray-100">
                <div className="flex flex-col items-stretch justify-center gap-4 px-2 pt-4 sm:px-4 lg:flex-row lg:items-start lg:pt-0">
                    {/* левая колонка */}
                    <aside className="order-2 w-full flex-shrink-0 lg:order-1 lg:w-52">
                        <SidebarTopPlayers />
                        <SidebarTopLevels />
                    </aside>

                    {/* центр */}
                    <main className="order-1 min-h-screen w-full max-w-4xl border-l border-r border-gray-200 bg-white shadow-xl lg:order-2 lg:min-w-[650px] lg:flex-1">
                        {children}
                    </main>

                    {/* правая колонка */}
                    <aside className="order-3 w-full flex-shrink-0 lg:w-52">
                        <SidebarStreams />
                        <SidebarNews />
                    </aside>
                </div>
            </div>
        </div>
    );
}

/** Шапка страницы внутри центральной колонки: заголовок + подпись. */
export function PageHeading({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
                {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
    );
}
