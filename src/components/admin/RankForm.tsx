import Link from 'next/link';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { Button, buttonVariants } from '@/src/components/ui/button';
import { LevelPicker, type ВариантУровня } from './LevelPicker';

/**
 * Форма уровня в собственном рейтинге — одна на добавление и на правку.
 *
 * Отличий два: при добавлении выбирается уровень, при правке он уже
 * определён и меняться не может (levelId — первичный ключ). И место
 * в списке спрашивается только при правке: новый уровень всегда
 * встаёт в конец, а дальше двигается кнопками.
 */

export type ЗначенияРейтинга = {
    уровень: ВариантУровня;
    position: number;
    requirement: number;
    note: string | null;
};

export function RankForm({
    action,
    уровни,
    запись,
    всего,
}: {
    action: (form: FormData) => Promise<void>;
    /** Все уровни Global Demonlist — для поиска по названию */
    уровни: ВариантУровня[];
    /** Заполнено при правке, пусто при добавлении */
    запись?: ЗначенияРейтинга;
    /** Сколько уровней в списке — чтобы подсказать границы места */
    всего: number;
}) {
    return (
        <form action={action} className="space-y-5">
            {запись ? (
                <div className="space-y-2">
                    <Label>Уровень</Label>
                    <div className="rounded-md border bg-muted/40 px-3 py-2.5">
                        <div className="text-sm font-medium">{запись.уровень.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {запись.уровень.builder} • в Global Demonlist #
                            {запись.уровень.position} • id {запись.уровень.id}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Уровень поменять нельзя. Если ошиблись — удалите запись
                        и добавьте нужный.
                    </p>
                </div>
            ) : (
                <LevelPicker уровни={уровни} />
            )}

            <div className="grid gap-5 sm:grid-cols-2">
                {запись && (
                    <div className="space-y-2">
                        <Label htmlFor="position">Место в нашем списке</Label>
                        <Input
                            id="position"
                            name="position"
                            type="number"
                            min={1}
                            max={всего}
                            defaultValue={запись.position}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            От 1 до {всего}. Остальные сдвинутся сами.
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
                        defaultValue={запись?.requirement ?? 100}
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
                    defaultValue={запись?.note ?? ''}
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
