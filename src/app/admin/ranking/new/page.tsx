import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { RankForm } from '@/src/components/admin/RankForm';
import { addLevel } from '../actions';

export const metadata: Metadata = { title: 'Добавить уровень', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function NewRankPage() {
    const всего = await prisma.communityRank.count();

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

            <h1 className="mb-1 text-2xl font-bold tracking-tight">Добавить уровень</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Встанет в конец списка — на место {всего + 1}. Двигать можно потом
                стрелками.
            </p>

            <Card>
                <CardContent>
                    <RankForm action={addLevel} all={всего + 1} />
                </CardContent>
            </Card>
        </div>
    );
}
