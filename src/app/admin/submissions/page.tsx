import type { Metadata } from 'next';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { Flag } from '@/src/components/Flag';
import { DeleteButton } from '@/src/components/admin/DeleteButton';
import { haveCountry } from '@/src/lib/countries';
import { allowNessage, declineMessage, deleteMessage } from './actions';

export const metadata: Metadata = { title: 'Заявки', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminSubmissionsPage() {
    const [wait, checked] = await Promise.all([
        prisma.submission.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
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

            {wait.length === 0 ? (
                <Card className="mb-8 p-12 text-center">
                    <p className="text-muted-foreground">Новых заявок нет</p>
                </Card>
            ) : (
                <div className="mb-8 space-y-3">
                    {wait.map((z) => (
                        <Card key={z.id}>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-lg font-bold">
                                            <Flag country={z.playerCountry} />
                                            {z.playerName}
                                            {z.kind === 'STREAMER' ? (
                                                <Badge variant="secondary">стример</Badge>
                                            ) : (
                                                <Badge variant="outline">рекорд</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {z.levelName} — {z.progress}%
                                            {z.playerCountry !== 'Unknown' &&
                                                ` • ${haveCountry(z.playerCountry)}`}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {z.createdAt.toLocaleString('ru')}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    {z.videoUrl && (
                                        <a
                                            href={z.videoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            Посмотреть видео
                                        </a>
                                    )}

                                    {z.twitchLogin && (
                                        <a
                                            href={`https://www.twitch.tv/${z.twitchLogin}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            Twitch: {z.twitchLogin}
                                        </a>
                                    )}

                                    {z.youtubeChannelId && (
                                        <a
                                            href={`https://www.youtube.com/channel/${z.youtubeChannelId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            Канал YouTube
                                        </a>
                                    )}
                                </div>

                                {z.comment && (
                                    <p className="rounded border bg-muted/40 p-3 text-sm whitespace-pre-line">
                                        {z.comment}
                                    </p>
                                )}

                                {z.contact && (
                                    <p className="text-xs text-muted-foreground">
                                        Связь: <span className="font-medium">{z.contact}</span>
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 border-t pt-3">
                                    <form
                                        action={async () => {
                                            'use server';
                                            await allowNessage(z.id);
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
                                            await declineMessage(z.id);
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
                                            await deleteMessage(z.id);
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

            {checked.length > 0 && (
                <>
                    <h2 className="mb-3 text-sm font-bold uppercase text-muted-foreground">
                        Уже рассмотренные
                    </h2>
                    <Card className="p-0">
                        {checked.map((z) => (
                            <div
                                key={z.id}
                                className="flex items-center gap-3 border-b p-3 last:border-b-0"
                            >
                                {z.status === 'APPROVED' ? (
                                    <Badge variant="secondary">одобрено</Badge>
                                ) : (
                                    <Badge variant="outline">отклонено</Badge>
                                )}
                                <span className="min-w-0 flex-1 truncate text-sm">
                                    {z.playerName} — {z.levelName} {z.progress}%
                                </span>
                                <span className="hidden text-xs text-muted-foreground sm:inline">
                                    {z.reviewedBy}
                                </span>

                                {/*
                                    Удаление разобранной заявки нужно, когда
                                    игрока приходится убирать с сайта: сначала
                                    удаляется стрим, потом эта запись, чтобы
                                    от него не осталось следов и в истории.
                                */}
                                <DeleteButton
                                    name={`${z.playerName} — ${z.levelName}`}
                                    what="Заявка"
                                    action={async () => {
                                        'use server';
                                        await deleteMessage(z.id);
                                    }}
                                />
                            </div>
                        ))}
                    </Card>
                </>
            )}
        </>
    );
}
