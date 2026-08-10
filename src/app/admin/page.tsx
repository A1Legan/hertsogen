import type { Metadata } from 'next';
import Link from 'next/link';
import { auth, signOut } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';

export const metadata: Metadata = {
    title: 'Управление',
    robots: { index: false, follow: false },
};

/** Админка всегда свежая: кэшировать её бессмысленно и вредно. */
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const сессия = await auth();

    // Считаем всё одним заходом в базу вместо трёх подряд
    const [новостей, черновиков, стримов, рейтинг] = await Promise.all([
        prisma.news.count({ where: { published: true } }),
        prisma.news.count({ where: { published: false } }),
        prisma.stream.count(),
        prisma.communityRank.count(),
    ]);

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between border-b border-gray-300 pb-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase text-gray-900">Управление</h1>
                        <p className="text-sm text-gray-500">{сессия?.user?.email}</p>
                    </div>

                    <form
                        action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/' });
                        }}
                    >
                        <button
                            type="submit"
                            className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                        >
                            Выйти
                        </button>
                    </form>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Раздел
                        href="/admin/news"
                        title="Новости"
                        описание={`${новостей} опубликовано${черновиков ? `, ${черновиков} в черновиках` : ''}`}
                    />
                    <Раздел
                        href="/admin/streams"
                        title="Стримы"
                        описание={`${стримов} в списке`}
                    />
                    <Раздел
                        href="/admin/ranking"
                        title="Свой рейтинг"
                        описание={`${рейтинг} уровней`}
                    />
                </div>

                <Link
                    href="/"
                    className="mt-6 inline-block text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                >
                    ← на сайт
                </Link>
            </div>
        </div>
    );
}

function Раздел({
    href,
    title,
    описание,
}: {
    href: string;
    title: string;
    описание: string;
}) {
    return (
        <Link
            href={href}
            className="block border border-gray-200 bg-white p-5 transition-all hover:border-orange-400 hover:shadow-sm"
        >
            <h2 className="mb-1 font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{описание}</p>
        </Link>
    );
}
