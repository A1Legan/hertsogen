import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { getLevels } from '@/src/lib/demonlist';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { StreamForm } from '@/src/components/admin/StreamForm';
import { updateStream } from '../actions';

export const metadata: Metadata = { title: 'Правка стрима', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditStreamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const live = await prisma.stream.findUnique({ where: { id } });
    if (!live) notFound();
    const level = live.levelId
        ? (await getLevels()).find((l) => l.id === live.levelId)
        : undefined;

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
                {live.playerName} — {live.levelName}
            </h1>

            <Card>
                <CardContent>
                    <StreamForm
                        action={updateStream.bind(null, id)}
                        live={{
                            playerName: live.playerName,
                            playerCountry: live.playerCountry,
                            levelId: live.levelId,
                            levelName: live.levelName,
                            levelPosition: level?.position,
                            levelBuilder: level?.builder,
                            progress: live.progress,
                            url: live.url,
                            isLive: live.isLive,
                            sortOrder: live.sortOrder,
                            twitchLogin: live.twitchLogin,
                            youtubeChannelId: live.youtubeChannelId,
                            youtubeVideoId: live.youtubeVideoId,
                            streamTitle: live.streamTitle,
                            updateToken: live.updateToken,
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
