import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Pencil, Radio, RadioTower } from 'lucide-react';
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
import { Flag } from '@/src/components/Flag';
import { удалитьСтрим, переключитьЭфир } from './actions';

export const metadata: Metadata = { title: 'Стримы', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminStreamsPage() {
    const стримы = await prisma.stream.findMany({
        orderBy: [{ isLive: 'desc' }, { sortOrder: 'asc' }, { progress: 'desc' }],
    });

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Стримы и прогрессы</h1>
                    <p className="text-sm text-muted-foreground">
                        Те, кто в эфире, показываются на сайте первыми.
                    </p>
                </div>
                <Link href="/admin/streams/new" className={buttonVariants()}>
                    <Plus className="size-4" />
                    Добавить
                </Link>
            </div>

            {стримы.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="mb-4 text-muted-foreground">Пока ничего нет</p>
                    <Link
                        href="/admin/streams/new"
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Добавить первый
                    </Link>
                </Card>
            ) : (
                <Card className="overflow-hidden p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Игрок</TableHead>
                                <TableHead>Уровень</TableHead>
                                <TableHead className="w-24">Прогресс</TableHead>
                                <TableHead className="w-28">Эфир</TableHead>
                                <TableHead className="w-32 text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {стримы.map((с) => (
                                <TableRow key={с.id}>
                                    <TableCell>
                                        <span className="flex items-center gap-2 font-medium">
                                            <Flag country={с.playerCountry} />
                                            {с.playerName}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-0 truncate text-muted-foreground">
                                        {с.levelName}
                                    </TableCell>
                                    <TableCell className="tabular-nums">{с.progress}%</TableCell>
                                    <TableCell>
                                        {с.isLive ? (
                                            <Badge className="bg-red-600 text-white">в эфире</Badge>
                                        ) : (
                                            <Badge variant="outline">не в эфире</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-0.5">
                                            <form
                                                action={async () => {
                                                    'use server';
                                                    await переключитьЭфир(с.id);
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={
                                                        с.isLive ? 'Снять с эфира' : 'Пометить в эфире'
                                                    }
                                                >
                                                    {с.isLive ? (
                                                        <RadioTower className="size-4 text-red-600" />
                                                    ) : (
                                                        <Radio className="size-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </form>

                                            <Link
                                                href={`/admin/streams/${с.id}`}
                                                aria-label="Править"
                                                className={buttonVariants({
                                                    variant: 'ghost',
                                                    size: 'icon',
                                                })}
                                            >
                                                <Pencil className="size-4 text-muted-foreground" />
                                            </Link>

                                            <DeleteButton
                                                название={`${с.playerName} — ${с.levelName}`}
                                                что="Стрим"
                                                action={async () => {
                                                    'use server';
                                                    await удалитьСтрим(с.id);
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
