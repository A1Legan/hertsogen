import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
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
        <div className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 border-b border-gray-300 pb-4">
                    <Link
                        href="/admin/news"
                        className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                    >
                        ← новости
                    </Link>
                    <h1 className="truncate text-2xl font-black uppercase text-gray-900">
                        {новость.title}
                    </h1>
                </div>

                <div className="border border-gray-200 bg-white p-6">
                    <NewsForm
                        // id подставляем здесь, форме о нём знать незачем
                        action={обновитьНовость.bind(null, id)}
                        новость={{
                            title: новость.title,
                            category: новость.category,
                            // input type="date" понимает только формат ГГГГ-ММ-ДД
                            date: новость.date.toISOString().slice(0, 10),
                            text: новость.text,
                            image: новость.image,
                            published: новость.published,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
