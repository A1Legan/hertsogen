import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, Radio, ListOrdered, ArrowRight } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

export const metadata: Metadata = { title: 'Обзор', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const [created, archived, lives, inLive, rank] = await Promise.all([
        prisma.news.count({ where: { published: true } }),
        prisma.news.count({ where: { published: false } }),
        prisma.stream.count(),
        prisma.stream.count({ where: { isLive: true } }),
        prisma.communityRank.count(),
    ]);

    return (
        <>
            <h1 className="mb-1 text-2xl font-bold tracking-tight">Обзор</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Всё, что можно менять на сайте, находится здесь.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SectionTile
                    href="/admin/news"
                    icon={Newspaper}
                    title="Новости"
                    main={String(created)}
                    signature="опубликовано"
                    image={archived > 0 ? `${archived} в черновиках` : null}
                />
                <SectionTile
                    href="/admin/streams"
                    icon={Radio}
                    title="Стримы"
                    main={String(lives)}
                    signature="в списке"
                    image={inLive > 0 ? `${inLive} в эфире` : null}
                />
                <SectionTile
                    href="/admin/ranking"
                    icon={ListOrdered}
                    title="Свой рейтинг"
                    main={String(rank)}
                    signature="уровней"
                    image={rank === 0 ? 'пусто' : null}
                />
            </div>
        </>
    );
}

function SectionTile({
    href,
    icon: Icon,
    title,
    main,
    signature,
    image,
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    main: string;
    signature: string;
    image: string | null;
}) {
    return (
        <Link href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-orange-400">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Icon className="size-4 text-muted-foreground" />
                        {title}
                        <ArrowRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </CardTitle>
                    <CardDescription>{signature}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-end gap-3">
                    <span className="text-3xl font-bold tabular-nums">{main}</span>
                    {image && (
                        <Badge variant="secondary" className="mb-1">
                            {image}
                        </Badge>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
