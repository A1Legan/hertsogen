import { getLevels } from '@/src/lib/demonlist';

const MUCH = 8;

export async function GET(req: Request) {
    const request = (new URL(req.url).searchParams.get('q') ?? '').trim().toLowerCase();

    if (request.length < 2) return Response.json([]);

    const levels = await getLevels();

    const founded = levels
        .filter(
            (l) =>
                l.name.toLowerCase().includes(request) ||
                l.builder.toLowerCase().includes(request),
        )
        .slice(0, MUCH)
        .map((l) => ({
            id: l.id,
            name: l.name,
            position: l.position,
            builder: l.builder,
            requirement: l.requirement,
        }));

    return Response.json(founded, {
        headers: { 'Cache-Control': 'public, max-age=300' },
    });
}
