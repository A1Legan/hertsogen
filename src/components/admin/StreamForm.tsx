import Link from 'next/link';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { Button, buttonVariants } from '@/src/components/ui/button';
import { COUNTRY_NAME, haveCountry } from '@/src/lib/countries';
import { percentPerName} from '@/src/lib/live';
import { LevelPicker } from '@/src/components/LevelPicker';

const ADMIN_FIELD =
    'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring';

export type LiveMessage = {
    playerName: string;
    playerCountry: string;
    levelId: number | null;
    levelName: string;
    levelPosition?: number | null;
    levelBuilder?: string | null;
    progress: number;
    url: string;
    isLive: boolean;
    sortOrder: number;
    twitchLogin: string | null;
    youtubeChannelId: string | null;
    youtubeVideoId?: string | null;
    streamTitle?: string | null;
    updateToken?: string | null;
};

export function StreamForm({
    action,
    live: live,
}: {
    action: (form: FormData) => Promise<void>;
    live?: LiveMessage;
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
                        defaultValue={live?.playerName ?? ''}
                        placeholder="Zoink"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="playerCountry">Страна</Label>
                    <select
                        id="playerCountry"
                        name="playerCountry"
                        defaultValue={live?.playerCountry ?? 'Unknown'}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                        <option value="Unknown">— не указана —</option>
                        {COUNTRY_NAME.map((страна) => (
                            <option key={страна} value={страна}>
                                {haveCountry(страна)}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                        Не указана — флаг просто не рисуется
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="поиск-уровня">Уровень</Label>
                <LevelPicker
                    fieldClass={ADMIN_FIELD}
                    chosed={
                        live?.levelId
                            ? {
                                    id: live.levelId,
                                    name: live.levelName,
                                    position: live.levelPosition ?? 0,
                                    builder: live.levelBuilder ?? '',
                            }
                            : undefined
                    }
                />
                {live && !live.levelId && (
                    <p className="text-xs text-muted-foreground">
                        Сейчас: «{live.levelName}». Уровень не привязан к списку,
                        поэтому запись не видна на его странице — выберите уровень,
                        чтобы это исправить.
                    </p>
                )}
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
                        defaultValue={live?.progress ?? 0}
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
                        defaultValue={live?.sortOrder ?? 0}
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
                    defaultValue={live?.url ?? ''}
                    placeholder="https://www.twitch.tv/..."
                />
                <p className="text-xs text-muted-foreground">
                    Обязательно вместе с https:// — иначе ссылка уведёт не туда
                </p>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <div>
                    <p className="text-sm font-medium">Отслеживать эфир автоматически</p>
                    <p className="text-xs text-muted-foreground">
                        Заполните одно из полей — и статус «в эфире» перестанет требовать
                        ручного переключения
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="twitchLogin">Ник на Twitch</Label>
                        <Input
                            id="twitchLogin"
                            name="twitchLogin"
                            maxLength={60}
                            placeholder="zoink"
                            defaultValue={live?.twitchLogin ?? ''}
                        />
                        <p className="text-xs text-muted-foreground">Указывается один раз</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="youtubeChannel">Канал на YouTube</Label>
                        <Input
                            id="youtubeChannel"
                            name="youtubeChannel"
                            maxLength={200}
                            placeholder="https://youtube.com/@ник"
                            defaultValue={live?.youtubeChannelId ?? ''}
                        />
                        <p className="text-xs text-muted-foreground">
                            Ссылка на канал или @ник. Тоже указывается один раз
                        </p>
                    </div>
                </div>

                {live?.streamTitle && (
                    <div className="rounded border bg-muted/40 p-3">
                        <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                            Название трансляции при последней проверке
                        </p>
                        <p className="text-sm">{live.streamTitle}</p>
                        {percentPerName(live.streamTitle) !== null && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                В названии нашлось{' '}
                                <span className="font-bold text-foreground">
                                    {percentPerName(live.streamTitle)}%
                                </span>{' '}
                                — впишите вручную, если это тот самый процент
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
                <Switch id="isLive" name="isLive" defaultChecked={live?.isLive ?? false} />
                <div>
                    <Label htmlFor="isLive">Сейчас в эфире</Label>
                    <p className="text-xs text-muted-foreground">
                        Если площадка указана выше, это поле перезапишется автоматически
                    </p>
                </div>
            </div>

            {live?.updateToken && (
                <div className="space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm font-medium">Личная ссылка стримера</p>
                    <code className="block break-all rounded bg-white px-3 py-2 text-xs">
                        /update/{live.updateToken}
                    </code>
                    <p className="text-xs text-muted-foreground">
                        Отправьте её игроку — по ней он меняет свой процент сам, без входа
                        и пароля. Не публикуйте: кто знает ссылку, тот может править эту строку.
                    </p>
                </div>
            )}

            <div className="flex items-center gap-3 border-t pt-4">
                <Button type="submit">Сохранить</Button>
                <Link href="/admin/streams" className={buttonVariants({ variant: 'ghost' })}>
                    Отмена
                </Link>
            </div>
        </form>
    );
}
