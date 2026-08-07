import Link from 'next/link';
import Image from 'next/image';
import type { Level, Player } from '@/src/lib/demonlist';
import { Flag } from './Flag';
import { Hint, ПОЯСНЕНИЯ } from './Hint';

/**
 * Карточка уровня в списке.
 *
 * players — словарь для флага верификатора. Может быть не передан
 * (тогда флаги просто не рисуются) и может не содержать нужного игрока:
 * из 102 верификаторов топ-150 в первой тысяче лидерборда находится 90.
 */
export function LevelCard({
    level,
    players,
    index = 0,
}: {
    level: Level;
    players?: Map<number, Player>;
    index?: number;
}) {
    const verifierCountry = players?.get(level.verifier.id)?.country ?? 'Unknown';
    const вРасширенном = level.position > 150;

    return (
        <article
            className="animate-card-entry card-hover mb-4 overflow-hidden border border-gray-200 bg-white shadow-sm"
            style={{ animationDelay: `${Math.min(index, 20) * 35}ms` }}
        >
            <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="w-8 text-center text-xl font-bold text-black sm:w-12 sm:text-2xl">
                        #{level.position}
                    </span>

                    <Image
                        src={level.thumbnail}
                        alt=""
                        width={112}
                        height={64}
                        className="h-12 w-20 flex-shrink-0 rounded bg-gray-100 object-cover sm:h-16 sm:w-28"
                    />

                    <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-gray-900 sm:text-xl">
                            <Link href={`/levels/${level.id}`} className="hover:text-orange-600">
                                {level.name}
                            </Link>
                        </h3>
                        <p className="mt-0.5 truncate text-xs sm:text-sm">
                            <span className="text-gray-400">by </span>
                            <span className="font-bold text-gray-800">{level.builder}</span>
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0 pl-11 text-left sm:pl-0 sm:text-right">
                    <div className="text-xl font-bold text-orange-600 sm:text-2xl">
                        {вРасширенном ? '—' : `${level.points.toFixed(2)} pts`}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">
                        {вРасширенном ? 'Extended list' : 'Очки'}
                        <Hint text={вРасширенном ? ПОЯСНЕНИЯ.extended : ПОЯСНЕНИЯ.points} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-between gap-4 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center">
                <div className="text-center sm:flex-1 sm:text-left">
                    <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                        Верифицировал
                        <Hint text={ПОЯСНЕНИЯ.verifier} />
                    </p>
                    <Link
                        href={`/players/${level.verifier.id}`}
                        className="inline-flex items-center gap-1.5 font-bold text-gray-800 hover:text-orange-600"
                    >
                        <Flag country={verifierCountry} />
                        {level.verifier.name}
                    </Link>
                </div>

                <div className="flex w-full flex-row items-center gap-2 sm:w-auto sm:flex-1 sm:justify-center">
                    {/* У 5 уровней из 1808 ссылка на видео битая — кнопки просто не будет */}
                    {level.videoUrl && (
                        <a
                            href={level.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 rounded bg-black px-4 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-gray-800 sm:flex-none sm:text-sm"
                        >
                            Смотреть
                        </a>
                    )}
                    <Link
                        href={`/levels/${level.id}`}
                        className="flex-1 rounded bg-gray-200 px-4 py-2 text-center text-xs font-bold text-black transition-colors hover:bg-gray-300 sm:flex-none sm:text-sm"
                    >
                        Подробнее
                    </Link>
                </div>

                <div className="text-center sm:flex-1 sm:text-right">
                    <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                        Нужно пройти
                        <Hint text={ПОЯСНЕНИЯ.requirement} />
                    </p>
                    <div className="text-xl font-bold text-gray-800">{level.requirement}%</div>
                </div>
            </div>
        </article>
    );
}
