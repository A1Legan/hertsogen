import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { NewsForm } from '@/src/components/admin/NewsForm';
import { обновитьНовость } from '../actions';

export const metadata: Metadata = { title: 'Правка новости', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditNewsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const новость = await prisma.news.findUnique({ where: { id } });
    if (!новость) notFound();

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

            <h1 className="mb-6 truncate text-2xl font-bold tracking-tight">{новость.title}</h1>

            <Card>
                <CardContent>
                    <NewsForm
                        // id подставляем здесь — форме о нём знать незачем,
                        // и в скрытом поле он не поедет, где его можно подменить
                        action={обновитьНовость.bind(null, id)}
                        новость={{
                            title: новость.title,
                            category: новость.category,
                            // input type="date" понимает только ГГГГ-ММ-ДД
                            date: новость.date.toISOString().slice(0, 10),
                            text: новость.text,
                            image: новость.image,
                            published: новость.published,
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
