import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { Flag } from '@/src/components/Flag';
import { UpdateProgressForm } from '@/src/components/UpdateProgressForm';

export const metadata: Metadata = {
    title: 'Обновить прогресс',
    // Личная ссылка не должна попасть в поисковики
    robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Личная страница стримера: /update/{ключ}
 *
 * Вход не нужен — ключ в адресе и есть пропуск. Страница нарочно
 * простая и крупная: её открывают с телефона одной рукой, между
 * попытками, и всё должно нажиматься не глядя.
 */
export default async function UpdatePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const стрим = await prisma.stream.findUnique({ where: { updateToken: token } });
    if (!стрим) notFound();

    return (
        <div className="mx-auto max-w-md px-4 py-10">
            <div className="border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <p className="mb-1 text-xs font-bold uppercase text-gray-400">
                        Обновление прогресса
                    </p>
                    <div className="flex items-center gap-2 text-xl font-black text-gray-900">
                        <Flag country={стрим.playerCountry} />
                        {стрим.playerName}
                    </div>
                </div>

                <UpdateProgressForm
                    token={token}
                    levelName={стрим.levelName}
                    progress={стрим.progress}
                />

                <div className="mt-6 border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-500">
                    <p className="mb-2">
                        Статус «в эфире» ставится сам — его мы узнаём у Twitch и YouTube.
                        Процент оттуда не виден никому, кроме вас, поэтому его вводите вручную.
                    </p>
                    <p>Ссылка личная. Не выкладывайте её в чат — по ней меняется ваша строка.</p>
                </div>
            </div>
        </div>
    );
}
