import Link from 'next/link';
import Image from 'next/image';
import { SidebarTopPlayers, SidebarTopLevels, SidebarStreams, SidebarNews } from './Sidebars';

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full justify-center gap-x-4 bg-black xl:gap-x-12">
            <Banner way="left" />

            <div className="w-full max-w-[1350px] bg-gray-100">
                <div className="flex flex-col items-stretch justify-center gap-4 px-2 pt-4 sm:px-4 lg:flex-row lg:items-start lg:pt-0">
                    <aside className="order-2 w-full flex-shrink-0 lg:order-1 lg:w-52">
                        <SidebarTopPlayers />
                        <SidebarTopLevels />
                    </aside>

                    <main className="order-1 min-h-screen w-full max-w-4xl border-l border-r border-gray-200 bg-white shadow-xl lg:order-2 lg:min-w-[650px] lg:flex-1">
                        <CollHeader />
                        {children}
                    </main>

                    <aside className="order-3 w-full flex-shrink-0 lg:w-52">
                        <SidebarStreams />
                        <SidebarNews />
                    </aside>
                </div>
            </div>

            <Banner way="right" />
        </div>
    );
}

function Banner({ way }: { way: 'left' | 'right' }) {
    return (
        <div className="hidden w-[200px] flex-shrink-0 xl:block">
            <div className="mt-6 flex w-full justify-center">
                <a href="https://www.youtube.com/@hertzogen" target="_blank" rel="noreferrer">
                    <Image
                        src={`/${way}-banner.png`}
                        alt="Баннер канала hertzogen"
                        width={200}
                        height={600}
                        priority
                        style={{ width: '100%', height: 'auto' }}
                    />
                </a>
            </div>
        </div>
    );
}

function CollHeader() {
    return (
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-200 px-4 py-4 text-center sm:flex-row sm:px-6 sm:py-6 sm:text-left">
            <Link href="/">
                <Image
                    src="/logo2.png"
                    alt="H&CR"
                    width={240}
                    height={64}
                    priority
                    style={{ width: 'auto', height: '3rem' }}
                    className="sm:!h-16"
                />
            </Link>
            <a
                href="https://demonlist.org/"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold uppercase text-gray-700 transition-colors hover:text-orange-500"
            >
                demonlist.org
            </a>
        </div>
    );
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
                {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
    );
}
