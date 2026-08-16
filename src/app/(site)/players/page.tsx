import type { Metadata } from 'next';
import Link from 'next/link';
import { getTopPlayers, searchPlayers, type Player } from '@/src/lib/demonlist';
import { Shell, PageHeading } from '@/src/components/Shell';
import { Flag } from '@/src/components/Flag';
import { Hint, ПОЯСНЕНИЯ } from '@/src/components/Hint';
import { SearchBox } from '@/src/components/SearchBox';
import { ShowMore } from '@/src/components/ShowMore';

export const metadata: Metadata = {
    title: 'Рейтинг игроков',
    description: 'Топ игроков Geometry Dash по сумме очков за пройденные демоны.',
};

const ШАГ = 100;

export default async function PlayersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; n?: string }>;
}) {
    const { q, n } = await searchParams;
    const запрос = q?.trim() ?? '';

    const сколько = Math.max(Number(n) || ШАГ, ШАГ);

    /*
     * Просим на одного больше, чем покажем.
     *
     * Так узнаём, есть ли продолжение, не выкачивая остальные 12 тысяч
     * аккаунтов. Лишний приходит и тут же отбрасывается — он нужен
     * только как ответ на вопрос «список кончился или нет».
     */
    const найденные: Player[] = запрос
        ? await searchPlayers(запрос, сколько + 1)
        : await getTopPlayers(сколько + 1);

    const естьЕщё = найденные.length > сколько;
    const players = найденные.slice(0, сколько);

    return (
        <Shell>
            <PageHeading
                title="Рейтинг игроков"
                subtitle="Место определяется суммой очков за пройденные уровни списка."
            />

            <div className="p-4 sm:p-6">
                <SearchBox placeholder="Ник игрока" подпись="Поиск по нику игрока" />

                {players.length === 0 ? (
                    <p className="border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600">
                        Игрок с ником «{запрос}» не найден. Ник ищется по части слова,
                        но написание должно совпадать — попробуйте покороче.
                    </p>
                ) : (
                    <>
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
                                    <span className="truncate font-bold text-gray-900">
                                        {p.name}
                                    </span>
                                </span>
                                <span className="font-bold text-gray-700">
                                    {p.points.toFixed(2)}
                                </span>
                            </Link>
                        ))}

                        <ShowMore
                            показано={players.length}
                            естьЕщё={естьЕщё}
                            шаг={ШАГ}
                            единицы="игроков"
                        />
                    </>
                )}
            </div>
        </Shell>
    );
}
