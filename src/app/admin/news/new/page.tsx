import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { NewsForm } from '@/src/components/admin/NewsForm';
import { createNews } from '../actions';

export const metadata: Metadata = { title: 'Новая новость', robots: { index: false } };

export default function NewNewsPage() {
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

            <h1 className="mb-6 text-2xl font-bold tracking-tight">Новая новость</h1>

            <Card>
                <CardContent>
                    <NewsForm action={createNews} />
                </CardContent>
            </Card>
        </div>
    );
}
