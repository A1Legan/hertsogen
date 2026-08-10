import type { Metadata } from 'next';
import { getLevels, getPlayers } from '@/src/lib/demonlist';
import { Shell, PageHeading } from '@/src/components/Shell';
import { RatingTabs } from '@/src/components/RatingTabs';
import { LevelCard } from '@/src/components/LevelCard';

export const metadata: Metadata = {
    title: 'Список уровней',
    description: 'Топ-150 сложнейших демонов Geometry Dash по версии Global Demonlist.',
};

export const revalidate = 3600;

const ПОКАЗЫВАЕМ = 150;

export default async function LevelsPage() {
    // Два независимых запроса — запускаем разом, а не по очереди
    const [все, players] = await Promise.all([getLevels(), getPlayers()]);
    const levels = все.slice(0, ПОКАЗЫВАЕМ);

    return (
        <Shell>
            <PageHeading
                title="Список уровней"
                subtitle="Наведите на «?» рядом с числом, чтобы узнать, что оно означает."
            />

            <RatingTabs active="global" />

            <div className="p-4 sm:p-6">
                {levels.map((level, index) => (
                    <LevelCard key={level.id} level={level} players={players} index={index} />
                ))}
            </div>
        </Shell>
    );
}
