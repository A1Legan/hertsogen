import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { Button, buttonVariants } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/src/components/ui/table';
import { DeleteButton } from '@/src/components/admin/DeleteButton';
import { deleteNews, changePost } from './actions';

export const metadata: Metadata = { title: 'Новости', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
    const news = await prisma.news.findMany({ orderBy: { date: 'desc' } });

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Новости</h1>
                    <p className="text-sm text-muted-foreground">
                        Черновики видны только здесь, на сайт они не попадают.
                    </p>
                </div>
                <Link href="/admin/news/new" className={buttonVariants()}>
                    <Plus className="size-4" />
                    Написать
                </Link>
            </div>

            {news.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="mb-4 text-muted-foreground">Пока ничего нет</p>
                    <Link
                        href="/admin/news/new"
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Написать первую
                    </Link>
                </Card>
            ) : (
                <Card className="overflow-hidden p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Заголовок</TableHead>
                                <TableHead className="w-32">Категория</TableHead>
                                <TableHead className="w-28">Дата</TableHead>
                                <TableHead className="w-28">Статус</TableHead>
                                <TableHead className="w-32 text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {news.map((н) => (
                                <TableRow key={н.id}>
                                    <TableCell className="max-w-0 truncate font-medium">
                                        {н.title}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {н.category}
                                    </TableCell>
                                    <TableCell className="tabular-nums text-muted-foreground">
                                        {н.date.toISOString().slice(0, 10)}
                                    </TableCell>
                                    <TableCell>
                                        {н.published ? (
                                            <Badge variant="secondary">на сайте</Badge>
                                        ) : (
                                            <Badge variant="outline">черновик</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-0.5">
                                            <form
                                                action={async () => {
                                                    'use server';
                                                    await changePost(н.id);
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={н.published ? 'Скрыть' : 'Опубликовать'}
                                                >
                                                    {н.published ? (
                                                        <EyeOff className="size-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="size-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </form>

                                            <Link
                                                href={`/admin/news/${н.id}`}
                                                aria-label="Править"
                                                className={buttonVariants({
                                                    variant: 'ghost',
                                                    size: 'icon',
                                                })}
                                            >
                                                <Pencil className="size-4 text-muted-foreground" />
                                            </Link>

                                            <DeleteButton
                                                name={н.title}
                                                what="Новость"
                                                action={async () => {
                                                    'use server';
                                                    await deleteNews(н.id);
                                                }}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </>
    );
}
