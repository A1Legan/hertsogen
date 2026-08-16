import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLevels } from '@/src/lib/demonlist';
import { prisma } from '@/src/lib/prisma';
import { Card, CardContent } from '@/src/components/ui/card';
import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { RankForm } from '@/src/components/admin/RankForm';
import { обновитьУровень } from '../actions';

export const metadata: Metadata = { title: 'Правка уровня', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditRankPage({
    params,
}: {
    params: Promise<{ levelId: string }>;
}) {
    const { levelId } = await params;

    // Адрес — это текст, а ключ в базе — число. Если в адресе окажется
    // не число, Number даст NaN, и запрос в базу лучше не делать вовсе
    const id = Number(levelId);
    if (!Number.isInteger(id)) notFound();

    const [запись, все, всего] = await Promise.all([
        prisma.communityRank.findUnique({ where: { levelId: id } }),
        getLevels(),
        prisma.communityRank.count(),
    ]);

    if (!запись) notFound();

    const уровень = все.find((l) => l.id === id);

    // Уровень удалили из Global Demonlist. Запись править всё равно можно —
    // хотя бы для того, чтобы её убрать, — но подставить название неоткуда
    const выбранный = уровень
        ? {
              id: уровень.id,
              name: уровень.name,
              position: уровень.position,
              builder: уровень.builder,
          }
        : {
              id,
              name: `Уровень id ${id}`,
              position: 0,
              builder: 'нет в Global Demonlist',
          };

    return (
        <div className="mx-auto max-w-2xl">
            <Link
                href="/admin/ranking"
                className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'mb-3 -ml-2 text-muted-foreground',
                )}
            >
                <ArrowLeft className="size-4" />
                Свой рейтинг
            </Link>

            <h1 className="mb-6 truncate text-2xl font-bold tracking-tight">
                {выбранный.name}
            </h1>

            <Card>
                <CardContent>
                    <RankForm
                        // levelId подставляем здесь: в скрытом поле формы
                        // его можно было бы подменить через инструменты
                        // разработчика и отредактировать чужую запись
                        action={обновитьУровень.bind(null, id)}
                        уровни={[]}
                        запись={{
                            уровень: выбранный,
                            position: запись.position,
                            requirement: запись.requirement,
                            note: запись.note,
                        }}
                        всего={всего}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
