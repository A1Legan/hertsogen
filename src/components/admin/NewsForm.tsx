import Link from 'next/link';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { Button, buttonVariants } from '@/src/components/ui/button';

/**
 * Что показать в полях. Свой тип, а не NewsItem с сайта: там нет поля
 * published, потому что публичным страницам черновики не отдаются.
 * Админке оно как раз нужно.
 */
export type ЗначенияНовости = {
    title: string;
    category: string;
    date: string;
    text: string;
    image: string | null;
    published: boolean;
};

/**
 * Форма новости — одна на создание и на правку.
 *
 * Отличаются они только тем, что подставлено в поля и куда уходит отправка.
 * Две почти одинаковые формы — верный способ поправить одну и забыть вторую.
 *
 * Несмотря на shadcn, это по-прежнему обычная HTML-форма с серверным
 * действием: компоненты дают внешний вид, а не механику. Клиентского
 * JavaScript тут нет, кроме самого переключателя.
 */
export function NewsForm({
    action,
    новость,
}: {
    action: (form: FormData) => Promise<void>;
    новость?: ЗначенияНовости;
}) {
    return (
        <form action={action} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input
                    id="title"
                    name="title"
                    required
                    maxLength={200}
                    defaultValue={новость?.title ?? ''}
                    placeholder="Society занимает первое место списка"
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Input
                        id="category"
                        name="category"
                        required
                        maxLength={50}
                        defaultValue={новость?.category ?? 'Новость'}
                    />
                    <p className="text-xs text-muted-foreground">
                        Показывается оранжевым над заголовком
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">Дата</Label>
                    <Input
                        id="date"
                        type="date"
                        name="date"
                        required
                        defaultValue={новость?.date ?? new Date().toISOString().slice(0, 10)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Можно поставить любую, не только сегодняшнюю
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="text">Текст</Label>
                <Textarea
                    id="text"
                    name="text"
                    required
                    rows={10}
                    defaultValue={новость?.text ?? ''}
                    className="leading-relaxed"
                />
            </div>

            <div className="space-y-3 rounded-lg border p-4">
                <Label htmlFor="картинка">Картинка</Label>

                {новость?.image && (
                    <div className="space-y-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={новость.image}
                            alt=""
                            className="h-32 w-full rounded border object-cover"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="удалитьКартинку" className="h-4 w-4" />
                            <span className="text-muted-foreground">Убрать картинку</span>
                        </label>
                    </div>
                )}

                <Input
                    id="картинка"
                    type="file"
                    name="картинка"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="cursor-pointer file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
                />
                <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP или GIF, до 5 МБ.{' '}
                    {новость?.image
                        ? 'Выберите новый файл, чтобы заменить.'
                        : 'Можно оставить пустым.'}
                </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
                <Switch
                    id="published"
                    name="published"
                    defaultChecked={новость?.published ?? false}
                />
                <div>
                    <Label htmlFor="published">Опубликовать</Label>
                    <p className="text-xs text-muted-foreground">
                        Выключено — черновик, на сайте не виден
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 border-t pt-4">
                <Button type="submit">Сохранить</Button>
                <Link href="/admin/news" className={buttonVariants({ variant: 'ghost' })}>
                    Отмена
                </Link>
            </div>
        </form>
    );
}
