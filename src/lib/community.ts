import { prisma } from './prisma';
import { getLevels, type Level } from './demonlist';
import { pointsForPos } from './points';

export type CommunityLevel = {
    level: Level;
    note: string | null;
};

export async function getCommunityRanking(): Promise<CommunityLevel[]> {
    const [rangs, levels] = await Promise.all([
        prisma.communityRank.findMany({ orderBy: { position: 'asc' } }),
        getLevels(),
    ]);

    const forId = new Map(levels.map((l) => [l.id, l]));

    const result: CommunityLevel[] = [];

    for (const p of rangs) {
        const original = forId.get(p.levelId);
        if (!original) continue;
        result.push({
            level: {
                ...original,
                position: p.position,
                requirement: p.requirement,
                points: pointsForPos(p.position) ?? 0,
            },
            note: p.note,
        });
    }

    return result;
}
