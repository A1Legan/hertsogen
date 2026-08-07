import type { Metadata } from 'next';
import Link from 'next/link';
import { getTopPlayers } from '@/src/lib/demonlist';
import { Shell, PageHeading } from '@/src/components/Shell';
import { Flag } from '@/src/components/Flag';
import { Hint, ПОЯСНЕНИЯ } from '@/src/components/Hint';

export const metadata: Metadata = {
    title: 'Рейтинг игроков',
    description: 'Топ игроков Geometry Dash по сумме очков за пройденные демоны.',
};

export const revalidate = 3600;

const ПОКАЗЫВАЕМ = 100;

export default async function PlayersPage() {
    const players = await getTopPlayers(ПОКАЗЫВАЕМ);

    return (
        <Shell>
            <PageHeading
                title="Рейтинг игроков"
                subtitle="Место определяется суммой очков за пройденные уровни списка."
            />

            <div className="p-4 sm:p-6">
                <div className="mb-2 flex items-center gap-4 border-b border-gray-200 px-3 pb-2 text-[10px] font-bold uppercase text-gray-400">
                    <span className="w-12">Место</span>
                    <span className="flex-1">Игрок</span>
                    <span>
                        Очки
                        <Hint text={ПОЯСНЕНИЯ.points} />
                    </span>
                </div>

                {players.map((p, index) => (
                    <Link
                        key={p.id}
                        href={`/players/${p.id}`}
                        style={{ animationDelay: `${Math.min(index, 20) * 25}ms` }}
                        className="animate-card-entry mb-1.5 flex items-center gap-4 border border-gray-200 bg-white px-3 py-2.5 transition-all hover:border-gray-400 hover:bg-gray-50"
                    >
                        <span
                            className={`w-12 text-lg font-bold ${
                                p.rank <= 3 ? 'text-orange-600' : 'text-gray-400'
                            }`}
                        >
                            #{p.rank}
                        </span>
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                            <Flag country={p.country} />
                            <span className="truncate font-bold text-gray-900">{p.name}</span>
                        </span>
                        <span className="font-bold text-gray-700">{p.points.toFixed(2)}</span>
                    </Link>
                ))}
            </div>
        </Shell>
    );
}
