import Link from 'next/link';

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
 * Форма новости — одна на создание и на редактирование.
 *
 * Отличаются они только тем, что подставлено в поля и куда уходит отправка.
 * Держать две почти одинаковые формы — верный способ поправить одну и забыть
 * про вторую.
 *
 * Клиентского JavaScript тут нет вовсе: обычная HTML-форма, обработчик на
 * сервере. Работает даже при отключённых скриптах.
 */
export function NewsForm({
    action,
    новость,
}: {
    action: (form: FormData) => Promise<void>;
    новость?: ЗначенияНовости;
}) {
    return (
        <form action={action} className="space-y-4">
            <Поле label="Заголовок">
                <input
                    name="title"
                    required
                    maxLength={200}
                    defaultValue={новость?.title ?? ''}
                    className="w-full border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                />
            </Поле>

            <div className="grid gap-4 sm:grid-cols-2">
                <Поле label="Категория" подсказка="Показывается оранжевым над заголовком">
                    <input
                        name="category"
                        required
                        maxLength={50}
                        defaultValue={новость?.category ?? 'Новость'}
                        className="w-full border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                    />
                </Поле>

                <Поле label="Дата" подсказка="Можно поставить любую, не только сегодняшнюю">
                    <input
                        type="date"
                        name="date"
                        required
                        defaultValue={новость?.date ?? new Date().toISOString().slice(0, 10)}
                        className="w-full border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                    />
                </Поле>
            </div>

            <Поле label="Текст">
                <textarea
                    name="text"
                    required
                    rows={10}
                    defaultValue={новость?.text ?? ''}
                    className="w-full border border-gray-300 px-3 py-2 leading-relaxed focus:border-orange-500 focus:outline-none"
                />
            </Поле>

            <Поле
                label="Картинка"
                подсказка="Путь к файлу в папке public, например /news1.png. Пусто — без картинки"
            >
                <input
                    name="image"
                    maxLength={300}
                    placeholder="/news1.png"
                    defaultValue={новость?.image ?? ''}
                    className="w-full border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                />
            </Поле>

            <label className="flex items-center gap-2 border border-gray-200 bg-gray-50 p-3">
                <input
                    type="checkbox"
                    name="published"
                    defaultChecked={новость?.published ?? false}
                    className="h-4 w-4"
                />
                <span className="text-sm">
                    <span className="font-bold">Опубликовать</span>
                    <span className="ml-2 text-gray-500">
                        снятая галочка — черновик, на сайте не виден
                    </span>
                </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    className="rounded bg-orange-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-orange-700"
                >
                    Сохранить
                </button>
                <Link
                    href="/admin/news"
                    className="text-sm font-bold uppercase text-gray-400 hover:text-gray-700"
                >
                    Отмена
                </Link>
            </div>
        </form>
    );
}

function Поле({
    label,
    подсказка,
    children,
}: {
    label: string;
    подсказка?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-gray-500">{label}</span>
            {children}
            {подсказка && <span className="mt-1 block text-xs text-gray-400">{подсказка}</span>}
        </label>
    );
}
