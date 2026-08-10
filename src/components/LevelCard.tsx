import Link from 'next/link';
import Image from 'next/image';
import type { Level, Player } from '@/src/lib/demonlist';
import { Flag } from './Flag';
import { Hint, ПОЯСНЕНИЯ } from './Hint';

/**
 * Карточка уровня. Как в прототипе: подробности спрятаны, раскрываются
 * по клику, у первого места открыты сразу.
 *
 * Сворачивание сделано на <details>/<summary> — это встроенные теги HTML.
 * В старом сайте для того же был обработчик onclick с ручным пересчётом
 * высоты; здесь всё делает браузер, работает без JavaScript и доступно
 * с клавиатуры.
 *
 * players — словарь для флага верификатора. Из 102 верификаторов топ-150
 * в первой тысяче лидерборда находится 90, остальные останутся без флага.
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
        <details
            open={level.position === 1}
            className="animate-card-entry card-hover group mb-4 overflow-hidden border border-gray-200 bg-white shadow-sm"
            style={{ animationDelay: `${Math.min(index, 20) * 35}ms` }}
        >
            <summary className="flex cursor-pointer list-none flex-col justify-between gap-3 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="w-8 text-center text-xl font-bold text-black sm:w-12 sm:text-2xl">
                        #{level.position}
                    </span>

                    {level.thumbnail ? (
                        <Image
                            src={level.thumbnail}
                            alt=""
                            width={112}
                            height={64}
                            className="h-12 w-20 flex-shrink-0 rounded bg-gray-100 object-cover sm:h-16 sm:w-28"
                        />
                    ) : (
                        <div
                            className="flex h-12 w-20 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-[9px] font-bold uppercase text-gray-400 sm:h-16 sm:w-28"
                            title="Видео прохождения недоступно"
                        >
                            нет видео
                        </div>
                    )}

                    <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-gray-900 sm:text-xl">
                            {level.name}
                        </h3>
                        <p className="mt-0.5 truncate text-xs sm:text-sm">
                            <span className="text-gray-400">by </span>
                            <span className="font-bold text-gray-800">{level.builder}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3 pl-11 sm:pl-0">
                    <div className="text-left sm:text-right">
                        <div className="text-xl font-bold text-orange-600 sm:text-2xl">
                            {вРасширенном ? '—' : `${level.points.toFixed(2)} pts`}
                        </div>
                        <div className="text-[10px] font-bold uppercase text-gray-400">
                            {вРасширенном ? 'Extended list' : 'Очки'}
                        </div>
                    </div>
                    {/* Стрелка переворачивается, когда карточка раскрыта */}
                    <span className="text-gray-300 transition-transform group-open:rotate-180">▾</span>
                </div>
            </summary>

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
                    {/* У 5 уровней из 1808 ссылка битая — кнопки просто не будет */}
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
                    <div className="text-xs font-bold text-gray-500">
                        {вРасширенном ? 'EL' : `${(level.points * 0.25).toFixed(2)} pts`}
                    </div>
                </div>
            </div>
        </details>
    );
}
