import { prisma } from './prisma';

export type Stream = {
    id: string;
    playerName: string;
    playerCountry: string;
    levelName: string;
    progress: number;
    isLive: boolean;
    url: string;
};

export async function getStreams(): Promise<Stream[]> {
    const record = await prisma.stream.findMany({
        orderBy: [{ isLive: 'desc' }, { sortOrder: 'asc' }, { progress: 'desc' }],
    });

    return record.map((s) => ({
        id: s.id,
        playerName: s.playerName,
        playerCountry: s.playerCountry,
        levelName: s.levelName,
        progress: s.progress,
        isLive: s.isLive,
        url: s.url,
    }));
}
