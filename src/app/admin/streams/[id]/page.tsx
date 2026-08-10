import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { StreamForm } from '@/src/components/admin/StreamForm';
import { обновитьСтрим } from '../actions';

export const metadata: Metadata = { title: 'Правка стрима', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditStreamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const стрим = await prisma.stream.findUnique({ where: { id } });
    if (!стрим) notFound();

    return (
        <div className="mx-auto max-w-2xl">
            <Link
                href="/admin/streams"
                className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'mb-3 -ml-2 text-muted-foreground',
                )}
            >
                <ArrowLeft className="size-4" />
                Стримы
            </Link>

            <h1 className="mb-6 truncate text-2xl font-bold tracking-tight">
                {стрим.playerName} — {стрим.levelName}
            </h1>

            <Card>
                <CardContent>
                    <StreamForm
                        action={обновитьСтрим.bind(null, id)}
                        стрим={{
                            playerName: стрим.playerName,
                            playerCountry: стрим.playerCountry,
                            levelName: стрим.levelName,
                            progress: стрим.progress,
                            url: стрим.url,
                            isLive: стрим.isLive,
                            sortOrder: стрим.sortOrder,
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
