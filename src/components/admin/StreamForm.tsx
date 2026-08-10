import Link from 'next/link';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { Button, buttonVariants } from '@/src/components/ui/button';
import { НАЗВАНИЯ_СТРАН, читаемаяСтрана } from '@/src/lib/countries';

export type ЗначенияСтрима = {
    playerName: string;
    playerCountry: string;
    levelName: string;
    progress: number;
    url: string;
    isLive: boolean;
    sortOrder: number;
};

/**
 * Форма стрима — одна на создание и на правку, как у новостей.
 *
 * Страна выбирается из списка, а не вводится руками: названия должны
 * совпадать с форматом Global Demonlist ('United-States' через дефис),
 * иначе флаг не найдётся. Заставлять человека это помнить — верный
 * способ получить пустые флаги и непонятно почему.
 */
export function StreamForm({
    action,
    стрим,
}: {
    action: (form: FormData) => Promise<void>;
    стрим?: ЗначенияСтрима;
}) {
    return (
        <form action={action} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="playerName">Игрок</Label>
                    <Input
                        id="playerName"
                        name="playerName"
                        required
                        maxLength={100}
                        defaultValue={стрим?.playerName ?? ''}
                        placeholder="Zoink"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="playerCountry">Страна</Label>
                    <select
                        id="playerCountry"
                        name="playerCountry"
                        defaultValue={стрим?.playerCountry ?? 'Unknown'}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                        <option value="Unknown">— не указана —</option>
                        {НАЗВАНИЯ_СТРАН.map((страна) => (
                            <option key={страна} value={страна}>
                                {читаемаяСтрана(страна)}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                        Не указана — флаг просто не рисуется
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="levelName">Уровень</Label>
                <Input
                    id="levelName"
                    name="levelName"
                    required
                    maxLength={150}
                    defaultValue={стрим?.levelName ?? ''}
                    placeholder="Society"
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="progress">Прогресс, %</Label>
                    <Input
                        id="progress"
                        type="number"
                        name="progress"
                        required
                        min={0}
                        max={100}
                        defaultValue={стрим?.progress ?? 0}
                    />
                    <p className="text-xs text-muted-foreground">
                        Лучший результат игрока на этом уровне
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sortOrder">Порядок</Label>
                    <Input
                        id="sortOrder"
                        type="number"
                        name="sortOrder"
                        min={0}
                        max={9999}
                        defaultValue={стрим?.sortOrder ?? 0}
                    />
                    <p className="text-xs text-muted-foreground">
                        Меньше число — выше в списке. Одинаковые сортируются по проценту
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="url">Ссылка на стрим</Label>
                <Input
                    id="url"
                    type="url"
                    name="url"
                    required
                    maxLength={300}
                    defaultValue={стрим?.url ?? ''}
                    placeholder="https://www.twitch.tv/..."
                />
                <p className="text-xs text-muted-foreground">
                    Обязательно вместе с https:// — иначе ссылка уведёт не туда
                </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
                <Switch id="isLive" name="isLive" defaultChecked={стрим?.isLive ?? false} />
                <div>
                    <Label htmlFor="isLive">Сейчас в эфире</Label>
                    <p className="text-xs text-muted-foreground">
                        Такие показываются первыми, с красным огоньком
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 border-t pt-4">
                <Button type="submit">Сохранить</Button>
                <Link href="/admin/streams" className={buttonVariants({ variant: 'ghost' })}>
                    Отмена
                </Link>
            </div>
        </form>
    );
}
