import type { Metadata } from 'next';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { Flag } from '@/src/components/Flag';
import { читаемаяСтрана } from '@/src/lib/countries';
import { одобритьЗаявку, отклонитьЗаявку, удалитьЗаявку } from './actions';

export const metadata: Metadata = { title: 'Заявки', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminSubmissionsPage() {
    const [ждут, рассмотренные] = await Promise.all([
        prisma.submission.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' }, // самые старые первыми: их дольше всего ждут
        }),
        prisma.submission.findMany({
            where: { status: { not: 'PENDING' } },
            orderBy: { reviewedAt: 'desc' },
            take: 20,
        }),
    ]);

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Заявки</h1>
                <p className="text-sm text-muted-foreground">
                    Присланное посетителями. На сайт попадает только после одобрения.
                </p>
            </div>

            {ждут.length === 0 ? (
                <Card className="mb-8 p-12 text-center">
                    <p className="text-muted-foreground">Новых заявок нет</p>
                </Card>
            ) : (
                <div className="mb-8 space-y-3">
                    {ждут.map((з) => (
                        <Card key={з.id}>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-lg font-bold">
                                            <Flag country={з.playerCountry} />
                                            {з.playerName}
                                            {з.kind === 'STREAMER' ? (
                                                <Badge variant="secondary">стример</Badge>
                                            ) : (
                                                <Badge variant="outline">рекорд</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {з.levelName} — {з.progress}%
                                            {з.playerCountry !== 'Unknown' &&
                                                ` • ${читаемаяСтрана(з.playerCountry)}`}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {з.createdAt.toLocaleString('ru')}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    {з.videoUrl && (
                                        <a
                                            href={з.videoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            Посмотреть видео
                                        </a>
                                    )}

                                    {з.twitchLogin && (
                                        <a
                                            href={`https://www.twitch.tv/${з.twitchLogin}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            Twitch: {з.twitchLogin}
                                        </a>
                                    )}

                                    {з.youtubeChannelId && (
                                        <a
                                            href={`https://www.youtube.com/channel/${з.youtubeChannelId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            Канал YouTube
                                        </a>
                                    )}
                                </div>

                                {з.comment && (
                                    <p className="rounded border bg-muted/40 p-3 text-sm whitespace-pre-line">
                                        {з.comment}
                                    </p>
                                )}

                                {з.contact && (
                                    <p className="text-xs text-muted-foreground">
                                        Связь: <span className="font-medium">{з.contact}</span>
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 border-t pt-3">
                                    <form
                                        action={async () => {
                                            'use server';
                                            await одобритьЗаявку(з.id);
                                        }}
                                    >
                                        <Button type="submit" size="sm">
                                            <Check className="size-4" />
                                            Одобрить
                                        </Button>
                                    </form>

                                    <form
                                        action={async () => {
                                            'use server';
                                            await отклонитьЗаявку(з.id);
                                        }}
                                    >
                                        <Button type="submit" size="sm" variant="outline">
                                            <X className="size-4" />
                                            Отклонить
                                        </Button>
                                    </form>

                                    <form
                                        action={async () => {
                                            'use server';
                                            await удалитьЗаявку(з.id);
                                        }}
                                        className="ml-auto"
                                    >
                                        <Button
                                            type="submit"
                                            size="sm"
                                            variant="ghost"
                                            aria-label="Удалить как спам"
                                        >
                                            <Trash2 className="size-4 text-muted-foreground" />
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {рассмотренные.length > 0 && (
                <>
                    <h2 className="mb-3 text-sm font-bold uppercase text-muted-foreground">
                        Уже рассмотренные
                    </h2>
                    <Card className="p-0">
                        {рассмотренные.map((з) => (
                            <div
                                key={з.id}
                                className="flex items-center gap-3 border-b p-3 last:border-b-0"
                            >
                                {з.status === 'APPROVED' ? (
                                    <Badge variant="secondary">одобрено</Badge>
                                ) : (
                                    <Badge variant="outline">отклонено</Badge>
                                )}
                                <span className="min-w-0 flex-1 truncate text-sm">
                                    {з.playerName} — {з.levelName} {з.progress}%
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {з.reviewedBy}
                                </span>
                            </div>
                        ))}
                    </Card>
                </>
            )}
        </>
    );
}
