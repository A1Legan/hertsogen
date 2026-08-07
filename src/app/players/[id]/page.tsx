import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlayers, getLevels } from '@/src/lib/demonlist';
import { Shell } from '@/src/components/Shell';
import { Flag } from '@/src/components/Flag';
import { Hint, ПОЯСНЕНИЯ } from '@/src/components/Hint';

export const revalidate = 3600;

export async function generateStaticParams() {
    const players = await getPlayers(500);
    return [...players.keys()].map((id) => ({ id: String(id) }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const player = (await getPlayers()).get(Number(id));

    if (!player) return { title: 'Игрок не найден' };

    return {
        title: player.name,
        description: `${player.name} — ${player.rank} место в рейтинге, ${player.points.toFixed(2)} очков.`,
    };
}

export default async function PlayerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [players, levels] = await Promise.all([getPlayers(), getLevels()]);
    const player = players.get(Number(id));

    if (!player) notFound();

    // Уровни, которые этот игрок верифицировал
    const верифицировал = levels
        .filter((l) => l.verifier.id === player.id)
        .sort((a, b) => a.position - b.position);

    return (
        <Shell>
            <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                <Link href="/players" className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600">
                    ← ко всему рейтингу
                </Link>
                <div className="mt-2 flex items-center gap-3">
                    <Flag country={player.country} />
                    <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{player.name}</h1>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <dl className="mb-6 grid grid-cols-2 gap-4">
                    <div className="border border-gray-200 bg-white p-4 text-center">
                        <dt className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                            Место в рейтинге
                        </dt>
                        <dd className="text-3xl font-black text-orange-600">#{player.rank}</dd>
                    </div>
                    <div className="border border-gray-200 bg-white p-4 text-center">
                        <dt className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                            Очки
                            <Hint text={ПОЯСНЕНИЯ.points} />
                        </dt>
                        <dd className="text-3xl font-black text-gray-900">
                            {player.points.toFixed(2)}
                        </dd>
                    </div>
                </dl>

                <h2 className="mb-3 text-sm font-bold uppercase text-gray-500">
                    Верифицированные уровни
                    <Hint text={ПОЯСНЕНИЯ.verifier} />
                </h2>

                {верифицировал.length === 0 ? (
                    <p className="border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                        Этот игрок не верифицировал уровней из текущего списка.
                    </p>
                ) : (
                    верифицировал.map((l) => (
                        <Link
                            key={l.id}
                            href={`/levels/${l.id}`}
                            className="mb-1.5 flex items-center gap-3 border border-gray-200 bg-white px-3 py-2.5 transition-all hover:border-gray-400 hover:bg-gray-50"
                        >
                            <span className="w-12 font-bold text-gray-400">#{l.position}</span>
                            <span className="flex-1 truncate font-bold text-gray-900">{l.name}</span>
                            <span className="text-sm text-gray-500">by {l.builder}</span>
                        </Link>
                    ))
                )}

                <p className="mt-6 text-xs text-gray-400">
                    Данные о рекордах игрока пока не подключены — для них нужен отдельный
                    запрос к API по каждому игроку. Появятся вместе с ночной синхронизацией.
                </p>
            </div>
        </Shell>
    );
}
