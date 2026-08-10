import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/src/lib/prisma';
import { удалитьНовость, переключитьПубликацию } from './actions';

export const metadata: Metadata = { title: 'Новости', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
    // Здесь берём ВСЕ новости, включая черновики — в отличие от getNews(),
    // которая отдаёт публичному сайту только опубликованные
    const новости = await prisma.news.findMany({ orderBy: { date: 'desc' } });

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between border-b border-gray-300 pb-4">
                    <div>
                        <Link
                            href="/admin"
                            className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                        >
                            ← управление
                        </Link>
                        <h1 className="text-2xl font-black uppercase text-gray-900">Новости</h1>
                    </div>
                    <Link
                        href="/admin/news/new"
                        className="rounded bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-700"
                    >
                        Написать
                    </Link>
                </div>

                {новости.length === 0 ? (
                    <p className="border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                        Пока ничего нет. Нажмите «Написать».
                    </p>
                ) : (
                    новости.map((н) => (
                        <div
                            key={н.id}
                            className="mb-2 flex items-center gap-4 border border-gray-200 bg-white p-4"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="mb-0.5 text-[11px] font-bold uppercase text-orange-600">
                                    {н.category} • {н.date.toISOString().slice(0, 10)}
                                    {!н.published && (
                                        <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-gray-600">
                                            черновик
                                        </span>
                                    )}
                                </div>
                                <div className="truncate font-bold text-gray-900">{н.title}</div>
                            </div>

                            {/*
                                Каждая кнопка — отдельная форма. Так надо:
                                вложенных форм в HTML не бывает, а действие
                                должно уходить со своими данными.
                            */}
                            <form
                                action={async () => {
                                    'use server';
                                    await переключитьПубликацию(н.id);
                                }}
                            >
                                <button
                                    type="submit"
                                    className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                                >
                                    {н.published ? 'Скрыть' : 'Опубликовать'}
                                </button>
                            </form>

                            <Link
                                href={`/admin/news/${н.id}`}
                                className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                            >
                                Править
                            </Link>

                            <form
                                action={async () => {
                                    'use server';
                                    await удалитьНовость(н.id);
                                }}
                            >
                                <button
                                    type="submit"
                                    className="text-xs font-bold uppercase text-gray-400 hover:text-red-600"
                                >
                                    Удалить
                                </button>
                            </form>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
