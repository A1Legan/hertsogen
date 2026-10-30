import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLevels, getPlayers } from '@/src/lib/demonlist';
import { prisma } from '@/src/lib/prisma';
import { Shell } from '@/src/components/Shell';
import { Flag } from '@/src/components/Flag';
import { Hint, SECRET } from '@/src/components/Hint';

export const revalidate = 3600;

export async function generateStaticParams() {
    const levels = await getLevels();
    return levels.slice(0, 150).map((l) => ({ id: String(l.id) }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const level = (await getLevels()).find((l) => String(l.id) === id);

    if (!level) return { title: 'Уровень не найден' };

    return {
        title: level.name,
        description: `${level.name} — ${level.position} место в списке демонов. Автор: ${level.builder}, верифицировал: ${level.verifier.name}.`,
    };
}

export default async function LevelPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [levels, players] = await Promise.all([getLevels(), getPlayers()]);
    const level = levels.find((l) => String(l.id) === id);

    if (!level) notFound();

    const request = await prisma.stream.findMany({
        where: { levelId: level.id },
        orderBy: [{ isLive: 'desc' }, { progress: 'desc' }],
    });

    const verifierCountry = players.get(level.verifier.id)?.country ?? 'Unknown';
    const inExtended = level.position > 150;
    const min = Math.floor(level.lengthSec / 60);
    const sec = level.lengthSec % 60;

    return (
        <Shell>
            <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                <Link href="/levels" className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600">
                    ← ко всему списку
                </Link>
                <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-3xl font-black text-orange-600">#{level.position}</span>
                    <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{level.name}</h1>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                    Построил <span className="font-bold text-gray-700">{level.builder}</span>
                    <Hint text={SECRET.builder} />
                </p>
            </div>

            <div className="p-4 sm:p-6">
                {level.thumbnail ? (
                    <Image
                        src={level.thumbnail}
                        alt=""
                        width={1280}
                        height={720}
                        className="mb-6 w-full rounded border border-gray-200 bg-gray-100 object-cover"
                        priority
                    />
                ) : (
                    <div className="mb-6 flex aspect-video w-full items-center justify-center rounded border border-dashed border-gray-300 bg-gray-100 text-sm font-bold uppercase text-gray-400">
                        Видео прохождения недоступно
                    </div>
                )}

                <dl className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatBox
                        label="Очки"
                        hint={inExtended ? SECRET.extended : SECRET.points}
                        value={level.points.toFixed(2)}
                    />
                    <StatBox
                        label="Нужно пройти"
                        hint={SECRET.requirement}
                        value={`${level.requirement}%`}
                    />
                    <StatBox
                        label="Место"
                        hint={SECRET.position}
                        value={`#${level.position}`}
                    />
                    <StatBox
                        label="Длительность"
                        hint="Продолжительность уровня по данным Global Demonlist."
                        value={`${min}:${String(sec).padStart(2, '0')}`}
                    />
                </dl>

                <div className="mb-6 border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                        Верифицировал
                        <Hint text={SECRET.verifier} />
                    </p>
                    <Link
                        href={`/players/${level.verifier.id}`}
                        className="inline-flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-orange-600"
                    >
                        <Flag country={verifierCountry} />
                        {level.verifier.name}
                    </Link>
                </div>

                {level.videoUrl ? (
                    <a
                        href={level.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded bg-black px-6 py-3 text-center font-bold text-white transition-colors hover:bg-gray-800"
                    >
                        Смотреть прохождение
                    </a>
                ) : (
                    <p className="rounded border border-dashed border-gray-300 px-6 py-3 text-center text-sm text-gray-500">
                        Видео прохождения недоступно — в источнике битая ссылка.
                    </p>
                )}

                {request.length > 0 && (
                    <div className="mt-8">
                        <h2 className="mb-3 text-sm font-bold uppercase text-gray-500">
                            Прохождения и прогрессы
                        </h2>

                        <p className="mb-3 text-xs text-gray-500">
                            Присланное посетителями H&amp;CR и одобренное модератором.
                            Список Global Demonlist ведётся отдельно.
                        </p>

                        {request.map((z) => (
                            <a
                                key={z.id}
                                href={z.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mb-1.5 flex items-center gap-3 border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-gray-400 hover:bg-gray-50"
                            >
                                <Flag country={z.playerCountry} />

                                <span className="min-w-0 flex-1 truncate font-bold text-gray-900">
                                    {z.playerName}
                                </span>

                                {z.isLive && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-500">
                                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                        Live
                                    </span>
                                )}
                                <span
                                    className={`text-sm font-bold ${
                                        z.progress >= 100 ? 'text-green-600' : 'text-gray-500'
                                    }`}
                                >
                                    {z.progress}%
                                </span>
                            </a>
                        ))}
                    </div>
                )}

                <p className="mt-6 text-xs text-gray-400">
                    ID уровня в игре: <span className="font-mono">{level.gdId}</span>
                </p>
            </div>
        </Shell>
    );
}

function StatBox({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <div className="border border-gray-200 bg-white p-3 text-center">
            <dt className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                {label}
                <Hint text={hint} />
            </dt>
            <dd className="text-xl font-bold text-gray-900">{value}</dd>
        </div>
    );
}
