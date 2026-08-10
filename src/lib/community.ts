import { prisma } from './prisma';
import { getLevels, type Level } from './demonlist';

/**
 * Собственный рейтинг H&CR — вторая вкладка на странице уровней.
 *
 * В базе лежат только id уровня и наша позиция. Всё остальное — название,
 * автор, превью, видео — берётся из Global Demonlist по этому id и
 * склеивается здесь. Так копия чужих данных нигде не заводится.
 */

export type CommunityLevel = {
    /** Данные уровня из API */
    level: Level;
    /** Наша позиция, а не позиция Global Demonlist */
    position: number;
    /** Наш требуемый процент */
    requirement: number;
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
        const level = поId.get(р.levelId);
        if (!level) continue; // уровня больше нет в источнике — пропускаем

        результат.push({
            level,
            position: р.position,
            requirement: р.requirement,
            note: р.note,
        });
    }

    return результат;
}
