import { prisma } from './prisma';
import { getLevels, type Level } from './demonlist';
import { очкиЗаПозицию } from './points';

/**
 * Собственный рейтинг H&CR — вторая вкладка на странице уровней.
 *
 * В базе лежат только id уровня и наша позиция. Всё остальное — название,
 * автор, превью, видео — берётся из Global Demonlist по этому id и
 * склеивается здесь. Так копия чужих данных нигде не заводится.
 */

export type CommunityLevel = {
    /**
     * Данные уровня из API, но position, requirement и points уже
     * подменены на наши. Компонентам не надо знать, из какого рейтинга
     * пришли эти числа — они просто рисуют то, что дали.
     */
    level: Level;
    /** Комментарий редакции: почему уровень стоит именно здесь */
    note: string | null;
};

/**
 * Наш список, отсортированный по нашим позициям.
 *
 * Если уровень выпал из списка Global Demonlist (такое бывает — уровни
 * удаляют из игры), запись просто пропускается: показать о нём нечего.
 */
export async function getCommunityRanking(): Promise<CommunityLevel[]> {
    const [ранги, уровни] = await Promise.all([
        prisma.communityRank.findMany({ orderBy: { position: 'asc' } }),
        getLevels(),
    ]);

    // Словарь для быстрого поиска: перебирать 1808 уровней на каждую
    // запись рейтинга — лишняя работа
    const поId = new Map(уровни.map((l) => [l.id, l]));

    const результат: CommunityLevel[] = [];

    for (const р of ранги) {
        const исходный = поId.get(р.levelId);
        if (!исходный) continue; // уровня больше нет в источнике — пропускаем

        результат.push({
            level: {
                ...исходный,

                // Позиция, требование и очки — НАШИ, а не из Global Demonlist.
                //
                // Очки считаются из нашей позиции по той же таблице, что у них
                // (см. points.ts). Брать очки, которые чужой список выдал этому
                // уровню, нельзя: они означают место в чужом порядке. Уровень,
                // стоящий у нас первым, должен давать 1000 очков, даже если
                // у Global он тридцатый.
                position: р.position,
                requirement: р.requirement,
                points: очкиЗаПозицию(р.position) ?? 0,
            },
            note: р.note,
        });
    }

    return результат;
}
