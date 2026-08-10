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
    // Четыре счётчика одним заходом вместо четырёх подряд
    const [опубликовано, черновиков, стримов, вЭфире, рейтинг] = await Promise.all([
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
                <ПлиткаРаздела
                    href="/admin/news"
                    icon={Newspaper}
                    title="Новости"
                    главное={String(опубликовано)}
                    подпись="опубликовано"
                    значок={черновиков > 0 ? `${черновиков} в черновиках` : null}
                />
                <ПлиткаРаздела
                    href="/admin/streams"
                    icon={Radio}
                    title="Стримы"
                    главное={String(стримов)}
                    подпись="в списке"
                    значок={вЭфире > 0 ? `${вЭфире} в эфире` : null}
                />
                <ПлиткаРаздела
                    href="/admin/ranking"
                    icon={ListOrdered}
                    title="Свой рейтинг"
                    главное={String(рейтинг)}
                    подпись="уровней"
                    значок={рейтинг === 0 ? 'пусто' : null}
                />
            </div>
        </>
    );
}

function ПлиткаРаздела({
    href,
    icon: Icon,
    title,
    главное,
    подпись,
    значок,
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    главное: string;
    подпись: string;
    значок: string | null;
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
                    <CardDescription>{подпись}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-end gap-3">
                    <span className="text-3xl font-bold tabular-nums">{главное}</span>
                    {значок && (
                        <Badge variant="secondary" className="mb-1">
                            {значок}
                        </Badge>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
