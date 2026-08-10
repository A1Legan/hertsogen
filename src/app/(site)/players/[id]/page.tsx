import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPlayers, getPlayerProfile, type PlayerRecord } from '@/src/lib/demonlist';
import { avatarUrl } from '@/src/lib/avatars';
import { Shell } from '@/src/components/Shell';
import { Flag } from '@/src/components/Flag';
import { Hint, ПОЯСНЕНИЯ } from '@/src/components/Hint';

export const revalidate = 3600;

/** Заранее собираем страницы первых 500 игроков, остальные — по заходу. */
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
    const profile = await getPlayerProfile(Number(id));

    if (!profile) return { title: 'Игрок не найден' };

    return {
        title: profile.name,
        description: `${profile.name} — ${profile.rank ?? '?'} место в рейтинге, ${profile.points.toFixed(2)} очков.`,
    };
}

export default async function PlayerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const profile = await getPlayerProfile(Number(id));

    if (!profile) notFound();

    const всегоПройдено =
        profile.main.length +
        profile.extended.length +
        profile.advanced.length +
        profile.unbounded.length;

    return (
        <Shell>
            <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                <Link
                    href="/players"
                    className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                >
                    ← ко всему рейтингу
                </Link>

                <div className="mt-3 flex items-center gap-4">
                    <Image
                        src={avatarUrl(profile.id)}
                        alt=""
                        width={72}
                        height={72}
                        className="h-16 w-16 flex-shrink-0 rounded border border-gray-200 bg-gray-100 object-cover"
                    />
                    <div className="min-w-0">
                        <h1 className="truncate text-2xl font-black text-gray-900 sm:text-3xl">
                            {profile.name}
                        </h1>
                        <div className="mt-1 flex items-center gap-2">
                            <Flag country={profile.country} />
                            <span className="text-sm text-gray-500">
                                {profile.country === 'Unknown'
                                    ? 'страна не указана'
                                    : profile.country.replace(/-/g, ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                {profile.isBanned && (
                    <p className="mt-3 border-l-4 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-700">
                        Игрок заблокирован в Global Demonlist. Его результаты не учитываются в рейтинге.
                    </p>
                )}
            </div>

            <div className="p-4 sm:p-6">
                <dl className="mb-6 grid grid-cols-3 gap-3">
                    <Показатель label="Место" value={profile.rank ? `#${profile.rank}` : '—'} акцент />
                    <Показатель
                        label="Очки"
                        value={profile.points.toFixed(2)}
                        hint={ПОЯСНЕНИЯ.points}
                    />
                    <Показатель label="Пройдено" value={String(всегоПройдено)} />
                </dl>

                {profile.hardest && (
                    <div className="mb-6 border border-orange-200 bg-orange-50 p-4">
                        <p className="mb-1 text-[10px] font-bold uppercase text-orange-700">
                            Сложнейший пройденный уровень
                        </p>
                        <Link
                            href={`/levels/${profile.hardest.levelId}`}
                            className="text-xl font-black text-gray-900 hover:text-orange-600"
                        >
                            #{profile.hardest.position} {profile.hardest.levelName}
                        </Link>
                    </div>
                )}

                <СписокРекордов
                    title="Верифицировал"
                    hint={ПОЯСНЕНИЯ.verifier}
                    records={profile.verified}
                    пустоТекст="Этот игрок не верифицировал уровней."
                    открытоПоУмолчанию
                />

                <СписокРекордов
                    title="Основной список"
                    hint="Пройденные уровни с 1 по 150 место. Только они приносят очки в рейтинг."
                    records={profile.main}
                    открытоПоУмолчанию
                />

                <СписокРекордов
                    title="Расширенный список"
                    hint={ПОЯСНЕНИЯ.extended}
                    records={profile.extended}
                />

                <СписокРекордов
                    title="Advanced"
                    hint="Уровни ниже расширенного списка."
                    records={profile.advanced}
                />

                <СписокРекордов
                    title="Unbounded"
                    hint="Самая дальняя часть списка."
                    records={profile.unbounded}
                />

                <СписокРекордов
                    title="Прогрессы"
                    hint="Уровни, которые игрок ещё не прошёл целиком, но показал результат."
                    records={profile.progress}
                />
            </div>
        </Shell>
    );
}

function Показатель({
    label,
    value,
    hint,
    акцент = false,
}: {
    label: string;
    value: string;
    hint?: string;
    акцент?: boolean;
}) {
    return (
        <div className="border border-gray-200 bg-white p-3 text-center">
            <dt className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                {label}
                {hint && <Hint text={hint} />}
            </dt>
            <dd className={`text-2xl font-black ${акцент ? 'text-orange-600' : 'text-gray-900'}`}>
                {value}
            </dd>
        </div>
    );
}

/**
 * Раздел с прохождениями. Свёрнут по умолчанию — у топовых игроков
 * в разделе бывает под сотню уровней, и разворачивать их все сразу
 * значит превратить страницу в бесконечную простыню.
 */
function СписокРекордов({
    title,
    hint,
    records,
    пустоТекст,
    открытоПоУмолчанию = false,
}: {
    title: string;
    hint: string;
    records: PlayerRecord[];
    пустоТекст?: string;
    открытоПоУмолчанию?: boolean;
}) {
    if (records.length === 0) {
        if (!пустоТекст) return null; // пустой раздел просто не показываем
        return (
            <div className="mb-4">
                <h2 className="mb-2 text-sm font-bold uppercase text-gray-500">
                    {title}
                    <Hint text={hint} />
                </h2>
                <p className="border border-dashed border-gray-300 p-3 text-center text-sm text-gray-500">
                    {пустоТекст}
                </p>
            </div>
        );
    }

    return (
        <details open={открытоПоУмолчанию} className="group mb-4 border border-gray-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between p-3 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                <h2 className="text-sm font-bold uppercase text-gray-600">
                    {title}
                    <Hint text={hint} />
                </h2>
                <span className="flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                        {records.length}
                    </span>
                    <span className="text-gray-300 transition-transform group-open:rotate-180">▾</span>
                </span>
            </summary>

            <div className="border-t border-gray-100 p-2">
                {records.map((r) => (
                    <div
                        key={`${r.levelId}-${r.position}`}
                        className="flex items-center gap-3 border-b border-gray-100 px-2 py-2 last:border-b-0 hover:bg-gray-50"
                    >
                        <span className="w-12 flex-shrink-0 text-sm font-bold text-gray-400">
                            #{r.position}
                        </span>
                        <Link
                            href={`/levels/${r.levelId}`}
                            className="min-w-0 flex-1 truncate font-bold text-gray-900 hover:text-orange-600"
                        >
                            {r.levelName}
                        </Link>
                        {r.videoUrl && (
                            <a
                                href={r.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-shrink-0 text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                            >
                                видео
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </details>
    );
}
