'use client';

import { useActionState } from 'react';
import { отправитьЗаявку, type СостояниеФормы } from '@/src/app/(site)/submit/actions';
import { НАЗВАНИЯ_СТРАН, читаемаяСтрана } from '@/src/lib/countries';

/**
 * Форма заявки на рекорд.
 *
 * Клиентский компонент — нужен, чтобы показать сообщение об ошибке
 * без перезагрузки страницы и не потерять заполненное. useActionState
 * связывает форму с серверным действием и хранит его ответ.
 *
 * Обрати внимание: сама проверка данных живёт на сервере, в actions.ts.
 * Здесь только показ ошибки. Всё, что проверяется в браузере, посетитель
 * может отключить — это удобство, а не защита.
 */

const ПОЛЕ =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none';

export function SubmitForm() {
    const [состояние, отправить, вПроцессе] = useActionState<СостояниеФормы, FormData>(
        отправитьЗаявку,
        undefined,
    );

    return (
        <form action={отправить} className="space-y-5">
            {/*
                Метка времени показа формы. Сервер сравнит её с моментом
                отправки: если прошло меньше трёх секунд, это не человек.
            */}
            <input type="hidden" name="открытоВ" value={Date.now()} />

            {/*
                Поле-приманка. Человек его не видит и не заполнит.
                Простой бот заполняет все поля, какие найдёт, — и выдаёт себя.
                Скрываем не через display:none, а уводя за экран: некоторые
                боты умеют пропускать скрытые поля.
            */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website">Сайт</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {состояние?.ошибка && (
                <p className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {состояние.ошибка}
                </p>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Ваш ник в игре
                    </span>
                    <input name="playerName" required maxLength={60} className={ПОЛЕ} />
                </label>

                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Страна
                    </span>
                    <select name="playerCountry" defaultValue="Unknown" className={ПОЛЕ}>
                        <option value="Unknown">— не указывать —</option>
                        {НАЗВАНИЯ_СТРАН.map((с) => (
                            <option key={с} value={с}>
                                {читаемаяСтрана(с)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Уровень
                </span>
                <input
                    name="levelName"
                    required
                    maxLength={120}
                    placeholder="Society"
                    className={ПОЛЕ}
                />
            </label>

            <label className="block sm:w-40">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Процент
                </span>
                <input
                    type="number"
                    name="progress"
                    required
                    min={1}
                    max={100}
                    className={ПОЛЕ}
                />
            </label>

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Ссылка на видео
                </span>
                <input
                    type="url"
                    name="videoUrl"
                    required
                    maxLength={200}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={ПОЛЕ}
                />
                <span className="mt-1 block text-xs text-gray-500">
                    Только YouTube. Без видео заявку не проверить
                </span>
            </label>

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Комментарий
                </span>
                <textarea name="comment" rows={3} maxLength={500} className={ПОЛЕ} />
                <span className="mt-1 block text-xs text-gray-500">Необязательно</span>
            </label>

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Как с вами связаться
                </span>
                <input
                    name="contact"
                    maxLength={120}
                    placeholder="@ник в Telegram или Discord"
                    className={ПОЛЕ}
                />
                <span className="mt-1 block text-xs text-gray-500">
                    Необязательно. Нужно, только если у нас возникнут вопросы
                </span>
            </label>

            <div className="border-t border-gray-200 pt-4">
                <button
                    type="submit"
                    disabled={вПроцессе}
                    className="rounded bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                >
                    {вПроцессе ? 'Отправляю…' : 'Отправить заявку'}
                </button>
                <p className="mt-3 text-xs text-gray-500">
                    Заявку посмотрит человек. На сайте она появится только после проверки —
                    обычно в течение пары дней.
                </p>
            </div>
        </form>
    );
}
