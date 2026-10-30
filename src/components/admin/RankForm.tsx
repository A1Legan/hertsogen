import Link from 'next/link';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { Button, buttonVariants } from '@/src/components/ui/button';
import { LevelPicker, type LevelVariant } from '@/src/components/LevelPicker';

const ADMIN_FIELD =
    'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring';


export type RankValue = {
    level: LevelVariant;
    position: number;
    requirement: number;
    note: string | null;
};

export function RankForm({
    action,
    record,
    all,
}: {
    action: (form: FormData) => Promise<void>;
    record?: RankValue;
    all: number;
}) {
    return (
        <form action={action} className="space-y-5">
            {record ? (
                <div className="space-y-2">
                    <Label>Уровень</Label>
                    <div className="rounded-md border bg-muted/40 px-3 py-2.5">
                        <div className="text-sm font-medium">{record.level.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {record.level.builder} • в Global Demonlist #
                            {record.level.position} • id {record.level.id}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Уровень поменять нельзя. Если ошиблись — удалите запись
                        и добавьте нужный.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="поиск-уровня">Уровень</Label>
                    <LevelPicker fieldClass={ADMIN_FIELD} />
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
                {record && (
                    <div className="space-y-2">
                        <Label htmlFor="position">Место в нашем списке</Label>
                        <Input
                            id="position"
                            name="position"
                            type="number"
                            min={1}
                            max={all}
                            defaultValue={record.position}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            От 1 до {all}. Остальные сдвинутся сами.
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="requirement">Требуемый процент</Label>
                    <Input
                        id="requirement"
                        name="requirement"
                        type="number"
                        min={1}
                        max={100}
                        defaultValue={record?.requirement ?? 100}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Сколько нужно пройти, чтобы рекорд попал в список.
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="note">Примечание редакции</Label>
                <Textarea
                    id="note"
                    name="note"
                    rows={3}
                    maxLength={500}
                    defaultValue={record?.note ?? ''}
                    placeholder="Почему уровень стоит именно здесь"
                />
                <p className="text-xs text-muted-foreground">
                    Необязательно. Показывается под карточкой на сайте.
                </p>
            </div>

            <div className="flex gap-2 border-t pt-4">
                <Button type="submit">Сохранить</Button>
                <Link href="/admin/ranking" className={buttonVariants({ variant: 'ghost' })}>
                    Отмена
                </Link>
            </div>
        </form>
    );
}
