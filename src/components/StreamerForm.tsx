'use client';

import { useActionState } from 'react';
import {
    отправитьЗаявкуСтримера,
    type СостояниеФормы,
} from '@/src/app/(site)/submit/stream/actions';
import { НАЗВАНИЯ_СТРАН, читаемаяСтрана } from '@/src/lib/countries';

/**
 * Заявка стримера.
 *
 * Отличается от заявки на рекорд смыслом: там «я прошёл, вот запись»,
 * здесь «я вещаю, следите за мной». Поэтому видео необязательно, зато
 * обязательна площадка и способ связи — модератору надо будет прислать
 * человеку личную ссылку для обновления процента.
 */

const ПОЛЕ =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none';

export function StreamerForm() {
    const [состояние, отправить, вПроцессе] = useActionState<СостояниеФормы, FormData>(
        отправитьЗаявкуСтримера,
        undefined,
    );

    return (
        <form action={отправить} className="space-y-5">
            <input type="hidden" name="открытоВ" value={Date.now()} />

            <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website-s">Сайт</label>
                <input id="website-s" name="website" type="text" tabIndex={-1} autoComplete="off" />
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

            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-bold text-gray-800">Где вы вещаете</p>

                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Ник на Twitch
                    </span>
                    <input name="twitch" maxLength={60} placeholder="ваш_ник" className={ПОЛЕ} />
                </label>

                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Канал на YouTube
                    </span>
                    <input
                        name="youtube"
                        maxLength={200}
                        placeholder="https://youtube.com/@ваш-ник"
                        className={ПОЛЕ}
                    />
                </label>

                <p className="text-xs text-gray-500">
                    Достаточно одной площадки. Если вещаете на обеих — заполните оба поля.
                    Статус «в эфире» будет включаться сам, вручную ничего делать не придётся.
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Какой уровень проходите
                    </span>
                    <input
                        name="levelName"
                        required
                        maxLength={120}
                        placeholder="Society"
                        className={ПОЛЕ}
                    />
                </label>

                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Текущий процент
                    </span>
                    <input
                        type="number"
                        name="progress"
                        min={0}
                        max={100}
                        defaultValue={0}
                        className={ПОЛЕ}
                    />
                    <span className="mt-1 block text-xs text-gray-500">
                        Потом сможете менять сами
                    </span>
                </label>
            </div>

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Как с вами связаться
                </span>
                <input
                    name="contact"
                    required
                    maxLength={120}
                    placeholder="@ник в Telegram или Discord"
                    className={ПОЛЕ}
                />
                <span className="mt-1 block text-xs text-gray-500">
                    Обязательно: по этому адресу пришлём личную ссылку, по которой вы будете
                    обновлять свой процент
                </span>
            </label>

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Комментарий
                </span>
                <textarea name="comment" rows={3} maxLength={500} className={ПОЛЕ} />
                <span className="mt-1 block text-xs text-gray-500">Необязательно</span>
            </label>

            <div className="border-t border-gray-200 pt-4">
                <button
                    type="submit"
                    disabled={вПроцессе}
                    className="rounded bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                >
                    {вПроцессе ? 'Отправляю…' : 'Отправить заявку'}
                </button>
            </div>
        </form>
    );
}
