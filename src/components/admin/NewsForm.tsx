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

            <div className="space-y-2">
                <Label htmlFor="image">Картинка</Label>
                <Input
                    id="image"
                    name="image"
                    maxLength={300}
                    placeholder="/news1.png"
                    defaultValue={новость?.image ?? ''}
                />
                <p className="text-xs text-muted-foreground">
                    Путь к файлу в папке public. Пусто — новость без картинки
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
