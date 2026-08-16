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

/** Сколько показываем сразу и на сколько прибавляет кнопка */
const ШАГ = 150;

export default async function LevelsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; n?: string }>;
}) {
    const { q, n } = await searchParams;

    // Два независимых запроса — запускаем разом, а не по очереди
    const [все, players] = await Promise.all([getLevels(), getPlayers()]);

    // Ищем по названию и по автору. Оба списка уже у нас в памяти,
    // ходить в API за поиском незачем — 1808 записей перебираются мгновенно.
    const запрос = q?.trim().toLowerCase() ?? '';
    const подходящие = запрос
        ? все.filter(
              (l) =>
                  l.name.toLowerCase().includes(запрос) ||
                  l.builder.toLowerCase().includes(запрос),
          )
        : все;

    // Число из адреса пришло строкой и может быть чем угодно — например,
    // человек руками впишет ?n=999999999. Ограничиваем сверху длиной списка
    const сколько = Math.min(
        Math.max(Number(n) || ШАГ, ШАГ),
        подходящие.length,
    );
    const levels = подходящие.slice(0, сколько);

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
                    подпись="Поиск по списку уровней"
                />

                {подходящие.length === 0 ? (
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
                            показано={levels.length}
                            естьЕщё={levels.length < подходящие.length}
                            шаг={ШАГ}
                            единицы="уровней"
                        />
                    </>
                )}
            </div>
        </Shell>
    );
}
