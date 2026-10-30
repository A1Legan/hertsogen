import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { NewsForm } from '@/src/components/admin/NewsForm';
import { updateNews } from '../actions';

export const metadata: Metadata = { title: 'Правка новости', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditNewsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) notFound();

    return (
        <div className="mx-auto max-w-2xl">
            <Link
                href="/admin/news"
                className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'mb-3 -ml-2 text-muted-foreground',
                )}
            >
                <ArrowLeft className="size-4" />
                Новости
            </Link>

            <h1 className="mb-6 truncate text-2xl font-bold tracking-tight">{news.title}</h1>

            <Card>
                <CardContent>
                    <NewsForm
                        action={updateNews.bind(null, id)}
                        news={{
                            title: news.title,
                            category: news.category,
                            date: news.date.toISOString().slice(0, 10),
                            text: news.text,
                            image: news.image,
                            published: news.published,
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
