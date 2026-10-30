import type { Metadata } from 'next';
import { getLevels, getPlayers } from '@/src/lib/demonlist';
import { Shell, PageHeading } from '@/src/components/Shell';
import { RatingTabs } from '@/src/components/RatingTabs';
import { LevelCard } from '@/src/components/LevelCard';
import { SearchBox } from '@/src/components/SearchBox';
import { ShowMore } from '@/src/components/ShowMore';

export const metadata: Metadata = {
    title: 'Список уровней',
    description: 'Топ-150 сложнейших демонов Geometry Dash по версии Global Demonlist.',
};
const STEP = 150;

export default async function LevelsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; n?: string }>;
}) {
    const { q, n } = await searchParams;

    const [all, players] = await Promise.all([getLevels(), getPlayers()]);

    const request = q?.trim().toLowerCase() ?? '';
    const approved = request
        ? all.filter(
            (l) =>
            l.name.toLowerCase().includes(request) ||
            l.builder.toLowerCase().includes(request),
        )
        : all;

    const howMuch = Math.min(
        Math.max(Number(n) || STEP, STEP),
        approved.length,
    );
    const levels = approved.slice(0, howMuch);

    return (
        <Shell>
            <PageHeading
                title="Список уровней"
                subtitle="Наведите на «?» рядом с числом, чтобы узнать, что оно означает."
            />

            <RatingTabs active="global" />

            <div className="p-4 sm:p-6">
                <SearchBox
                    placeholder="Название уровня или автор"
                    signature="Поиск по списку уровней"
                />

                {approved.length === 0 ? (
                    <p className="border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600">
                        По запросу «{q}» ничего не нашлось. Попробуйте часть названия —
                        например, «tidal» вместо «Tidal Wave».
                    </p>
                ) : (
                    <>
                        {levels.map((level, index) => (
                            <LevelCard
                                key={level.id}
                                level={level}
                                players={players}
                                index={index}
                            />
                        ))}

                        <ShowMore
                            showed={levels.length}
                            more={levels.length < approved.length}
                            step={STEP}
                            amount="уровней"
                        />
                    </>
                )}
            </div>
        </Shell>
    );
}
