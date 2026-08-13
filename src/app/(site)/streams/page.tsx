import type { Metadata } from 'next';
import Link from 'next/link';
import { getStreams } from '@/src/lib/streams';
import { Shell, PageHeading } from '@/src/components/Shell';
import { Flag } from '@/src/components/Flag';

export const metadata: Metadata = {
    title: 'Стримы и прогрессы',
    description: 'Кто прямо сейчас проходит сложнейшие демоны Geometry Dash.',
};

/** Единственные живые данные на сайте — обновляем часто. */
export const revalidate = 60;

export default async function StreamsPage() {
    const streams = await getStreams();

    return (
        <Shell>
            <PageHeading
                title="Стримы и прогрессы"
                subtitle="Процент — это лучший результат, которого игрок добился на уровне."
            />

            {/* Своя форма вместо гугл-формы: не уводит с сайта и не зависит
                от чужого сервиса */}
            <div className="border-b border-gray-200 bg-orange-50 px-4 py-4 sm:px-6">
                <p className="mb-2 text-sm text-gray-700">
                    Прошли уровень или показали хороший процент? Расскажите — добавим в список.
                </p>
                <Link
                    href="/submit"
                    className="inline-block rounded bg-orange-600 px-5 py-2.5 text-sm font-bold uppercase text-white transition-colors hover:bg-orange-700"
                >
                    Внести свой рекорд
                </Link>
            </div>

            <div className="p-4 sm:p-6">
                {streams.map((s, index) => (
                    <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ animationDelay: `${Math.min(index, 20) * 35}ms` }}
                        className="animate-card-entry card-hover mb-4 block border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <div className="mb-2 flex items-center text-[10px] font-bold uppercase">
                            <span
                                className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                                    s.isLive ? 'animate-pulse bg-red-500' : 'bg-gray-400'
                                }`}
                            />
                            <span className={s.isLive ? 'text-red-500' : 'text-gray-400'}>
                                {s.isLive ? 'В эфире' : 'Не в эфире'}
                            </span>
                        </div>

                        <div className="mb-2 flex items-center gap-2">
                            <Flag country={s.playerCountry} />
                            <span className="text-lg font-bold text-gray-900">{s.playerName}</span>
                        </div>

                        <div className="mb-2 text-sm text-gray-600">
                            проходит <span className="font-bold text-gray-900">{s.levelName}</span>
                        </div>

                        {/* Полоса прогресса: цифру видно, но полоса понятнее с первого взгляда */}
                        <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded bg-gray-200">
                                <div
                                    className="h-full rounded bg-orange-600"
                                    style={{ width: `${s.progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{s.progress}%</span>
                        </div>
                    </a>
                ))}
            </div>
        </Shell>
    );
}
