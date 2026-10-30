import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { getLevels } from '@/src/lib/demonlist';
import { Button, buttonVariants } from '@/src/components/ui/button';
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
import { deleteLevel as deleteLevel, move } from './actions';

export const metadata: Metadata = { title: 'Свой рейтинг', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminRankingPage() {
    const [records, levels] = await Promise.all([
        prisma.communityRank.findMany({ orderBy: { position: 'asc' } }),
        getLevels(),
    ]);

    const forId = new Map(levels.map((l) => [l.id, l]));

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Свой рейтинг</h1>
                    <p className="text-sm text-muted-foreground">
                        Порядок наш, всё остальное подтягивается из Global Demonlist.
                    </p>
                </div>
                <Link href="/admin/ranking/new" className={buttonVariants()}>
                    <Plus className="size-4" />
                    Добавить
                </Link>
            </div>

            {records.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="mb-4 text-muted-foreground">
                        Список пуст. Первый добавленный уровень станет топ-1.
                    </p>
                    <Link
                        href="/admin/ranking/new"
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
                                <TableHead className="w-16">Место</TableHead>
                                <TableHead>Уровень</TableHead>
                                <TableHead className="w-28">В Global</TableHead>
                                <TableHead className="w-24">Процент</TableHead>
                                <TableHead className="w-40 text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {records.map((z, index) => {
                                const level = forId.get(z.levelId);

                                return (
                                    <TableRow key={z.levelId}>
                                        <TableCell className="text-lg font-bold tabular-nums">
                                            {z.position}
                                        </TableCell>

                                        <TableCell className="max-w-0">
                                            {level ? (
                                                <>
                                                    <div className="truncate font-medium">
                                                        {level.name}
                                                    </div>
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {level.builder}
                                                        {z.note && ` • ${z.note}`}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-sm text-red-600">
                                                    Уровня id {z.levelId} больше нет в Global
                                                    Demonlist — на сайте он не показывается
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="tabular-nums text-muted-foreground">
                                            {level ? `#${level.position}` : '—'}
                                        </TableCell>

                                        <TableCell className="tabular-nums">
                                            {z.requirement}%
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center justify-end gap-0.5">
                                                <form
                                                    action={async () => {
                                                        'use server';
                                                        await move(z.levelId, 'вверх');
                                                    }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={index === 0}
                                                        aria-label="Поднять выше"
                                                    >
                                                        <ChevronUp className="size-4" />
                                                    </Button>
                                                </form>

                                                <form
                                                    action={async () => {
                                                        'use server';
                                                        await move(z.levelId, 'вниз');
                                                    }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={index === records.length - 1}
                                                        aria-label="Опустить ниже"
                                                    >
                                                        <ChevronDown className="size-4" />
                                                    </Button>
                                                </form>

                                                <Link
                                                    href={`/admin/ranking/${z.levelId}`}
                                                    aria-label="Править"
                                                    className={buttonVariants({
                                                        variant: 'ghost',
                                                        size: 'icon',
                                                    })}
                                                >
                                                    <Pencil className="size-4 text-muted-foreground" />
                                                </Link>

                                                <DeleteButton
                                                    name={level?.name ?? `id ${z.levelId}`}
                                                    what="Уровень"
                                                    action={async () => {
                                                        'use server';
                                                        await deleteLevel(z.levelId);
                                                    }}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </>
    );
}
