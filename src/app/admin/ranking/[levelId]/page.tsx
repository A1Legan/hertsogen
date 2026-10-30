import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLevels } from '@/src/lib/demonlist';
import { prisma } from '@/src/lib/prisma';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { RankForm } from '@/src/components/admin/RankForm';
import { updateLevel } from '../actions';

export const metadata: Metadata = { title: 'Правка уровня', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditRankPage({
    params,
}: {
    params: Promise<{ levelId: string }>;
}) {
    const { levelId } = await params;

    const id = Number(levelId);
    if (!Number.isInteger(id)) notFound();

    const [makr, all, much] = await Promise.all([
        prisma.communityRank.findUnique({ where: { levelId: id } }),
        getLevels(),
        prisma.communityRank.count(),
    ]);

    if (!makr) notFound();

    const level = all.find((l) => l.id === id);

    const choosen = level
        ? {
            id: level.id,
            name: level.name,
            position: level.position,
            builder: level.builder,
        }
        : {
            id,
            name: `Уровень id ${id}`,
            position: 0,
            builder: 'нет в Global Demonlist',
        };

    return (
        <div className="mx-auto max-w-2xl">
            <Link
                href="/admin/ranking"
                className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'mb-3 -ml-2 text-muted-foreground',
                )}
            >
                <ArrowLeft className="size-4" />
                Свой рейтинг
            </Link>

            <h1 className="mb-6 truncate text-2xl font-bold tracking-tight">
                {choosen.name}
            </h1>

            <Card>
                <CardContent>
                    <RankForm
                        action={updateLevel.bind(null, id)}
                        record={{
                            level: choosen,
                            position: makr.position,
                            requirement: makr.requirement,
                            note: makr.note,
                        }}
                        all={much}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
