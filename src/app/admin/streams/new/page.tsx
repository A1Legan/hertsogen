import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { StreamForm } from '@/src/components/admin/StreamForm';
import { создатьСтрим } from '../actions';

export const metadata: Metadata = { title: 'Новый стрим', robots: { index: false } };

export default function NewStreamPage() {
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

            <h1 className="mb-6 text-2xl font-bold tracking-tight">Новый стрим</h1>

            <Card>
                <CardContent>
                    <StreamForm action={создатьСтрим} />
                </CardContent>
            </Card>
        </div>
    );
}
