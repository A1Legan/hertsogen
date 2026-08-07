import Link from 'next/link';
import { getLevels, getTopPlayers } from '@/src/lib/demonlist';
import { getStreams } from '@/src/lib/streams';
import { getNews } from '@/src/lib/news';
import { Flag } from './Flag';

/**
 * Четыре блока боковых колонок.
 *
 * Каждый — самостоятельный серверный компонент: сам берёт свои данные,
 * страницам ничего передавать не нужно. Next при сборке заметит, что
 * getLevels() вызывается из нескольких мест, и сходит в API один раз.
 */

function SidebarBlock({
    title,
    href,
    children,
}: {
    title: string;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-2 overflow-hidden border border-gray-200 bg-white shadow-sm lg:mb-6">
            <Link href={href}>
                <h3 className="border-b border-orange-200 p-4 font-bold uppercase text-gray-800 transition-colors hover:text-orange-600">
                    {title}
                </h3>
            </Link>
            <div className="flex flex-col p-1.5">{children}</div>
        </div>
    );
}

function FullListButton({ href }: { href: string }) {
    return (
        <Link
            href={href}
            className="block w-full border border-gray-200 py-2 text-center text-xs font-bold uppercase text-orange-600 transition-all hover:bg-orange-600 hover:text-white"
        >
            Полный список
        </Link>
    );
}

export async function SidebarTopPlayers() {
    const players = await getTopPlayers(5);

    return (
        <SidebarBlock title="Топ игроков" href="/players">
            {players.map((p) => (
                <Link
                    key={p.id}
                    href={`/players/${p.id}`}
                    className="mb-1.5 block border border-gray-200 p-2.5 transition-all hover:border-gray-500 hover:bg-gray-50"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-5 text-sm font-bold text-gray-500">#{p.rank}</span>
                        <Flag country={p.country} />
                        <span className="truncate text-sm font-bold text-gray-900">{p.name}</span>
                    </div>
                </Link>
            ))}
            <FullListButton href="/players" />
        </SidebarBlock>
    );
}

export async function SidebarTopLevels() {
    const levels = (await getLevels()).slice(0, 5);

    return (
        <SidebarBlock title="Топ уровней" href="/levels">
            {levels.map((l) => (
                <Link
                    key={l.id}
                    href={`/levels/${l.id}`}
                    className="mb-1.5 block border border-gray-200 p-2.5 transition-all hover:border-gray-500 hover:bg-gray-50"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-5 text-sm font-bold text-gray-500">#{l.position}</span>
                        <span className="truncate text-sm font-bold text-gray-900">{l.name}</span>
                    </div>
                </Link>
            ))}
            <FullListButton href="/levels" />
        </SidebarBlock>
    );
}

export async function SidebarStreams() {
    const streams = (await getStreams()).slice(0, 5);

    return (
        <SidebarBlock title="Стримы и прогрессы" href="/streams">
            {streams.map((s) => (
                <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-1.5 block border border-gray-200 px-3 py-2.5 transition-colors hover:bg-gray-50"
                >
                    <div className="mb-1.5 flex items-center text-[10px] font-bold uppercase">
                        <span
                            className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                                s.isLive ? 'animate-pulse bg-red-500' : 'bg-gray-400'
                            }`}
                        />
                        <span className={s.isLive ? 'text-red-500' : 'text-gray-400'}>
                            {s.isLive ? 'Live' : 'Offline'}
                        </span>
                    </div>
                    <div className="mb-1 flex items-center gap-2">
                        <Flag country={s.playerCountry} />
                        <span className="truncate text-sm font-bold text-gray-900">
                            {s.playerName}
                        </span>
                    </div>
                    <div className="truncate text-xs font-medium text-gray-600">
                        {s.levelName} — <span className="font-bold text-gray-900">{s.progress}%</span>
                    </div>
                </a>
            ))}
            <FullListButton href="/streams" />
        </SidebarBlock>
    );
}

export async function SidebarNews() {
    const news = (await getNews()).slice(0, 5);

    return (
        <SidebarBlock title="Новости" href="/news">
            {news.map((n) => (
                <Link
                    key={n.id}
                    href={`/news#news-${n.id}`}
                    className="mb-1.5 block border border-gray-200 p-3 transition-all hover:border-gray-400 hover:bg-gray-50"
                >
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-orange-500">
                        {n.category} • {n.date}
                    </div>
                    <div className="text-sm font-bold leading-tight text-gray-900">{n.title}</div>
                </Link>
            ))}
            <FullListButton href="/news" />
        </SidebarBlock>
    );
}
