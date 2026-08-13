import type { Metadata } from 'next';
import { getCommunityRanking } from '@/src/lib/community';
import { getPlayers } from '@/src/lib/demonlist';
import { Shell, PageHeading } from '@/src/components/Shell';
import { RatingTabs } from '@/src/components/RatingTabs';
import { LevelCard } from '@/src/components/LevelCard';

export const metadata: Metadata = {
    title: 'Рейтинг Hertzogen и сообщества',
    description: 'Собственный список сложности от Hertzogen и сообщества.',
};

/** Наш список меняется вручную, обновляем чаще внешнего. */
export const revalidate = 600;

export default async function CommunityRatingPage() {
    const [ranking, players] = await Promise.all([getCommunityRanking(), getPlayers()]);

    return (
        <Shell>
            <PageHeading
                title="Рейтинг Hertzogen и сообщества"
                subtitle="Собственная оценка сложности, а не копия чужого списка."
            />

            <RatingTabs active="community" />

            <div className="p-4 sm:p-6">
                {ranking.length === 0 ? (
                    <div className="border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                        <p className="mb-2 text-lg font-bold text-gray-900">Список пока пуст</p>
                        <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
                            Здесь появится собственный список сложности, составленный Hertzogen
                            вместе с сообществом. Порядок уровней тут определяем мы, а не
                            Global Demonlist.
                        </p>
                    </div>
                ) : (
                    ranking.map((item, index) => (
                        <div key={item.level.id}>
                            {/*
                                Позиция, требование и очки внутри item.level
                                уже наши — их подменил getCommunityRanking().
                                Карточка не знает, из какого рейтинга пришли
                                числа, и знать не должна.
                            */}
                            <LevelCard level={item.level} players={players} index={index} />

                            {item.note && (
                                <p className="-mt-2 mb-4 border-l-4 border-orange-300 bg-orange-50 px-4 py-2 text-sm text-gray-700">
                                    {item.note}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Shell>
    );
}
