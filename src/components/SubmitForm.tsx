'use client';

import { useActionState } from 'react';
import { sendMessage, type FormStatus } from '@/src/app/(site)/submit/actions';
import { COUNTRY_NAME, haveCountry } from '@/src/lib/countries';
import { LevelPicker } from './LevelPicker';

const FIELD =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none';

export function SubmitForm() {
    const [status, send, inProgress] = useActionState<FormStatus, FormData>(
        sendMessage,
        undefined,
    );

    return (
        <form action={send} className="space-y-5">
            <input type="hidden" name="открытоВ" value={Date.now()} />
            <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website">Сайт</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {status?.error && (
                <p className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {status.error}
                </p>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Ваш ник в игре
                    </span>
                    <input name="playerName" required maxLength={60} className={FIELD} />
                </label>

                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Страна
                    </span>
                    <select name="playerCountry" defaultValue="Unknown" className={FIELD}>
                        <option value="Unknown">— не указывать —</option>
                        {COUNTRY_NAME.map((c) => (
                            <option key={c} value={c}>
                                {haveCountry(c)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="block">
                <label
                    htmlFor="поиск-уровня"
                    className="mb-1 block text-xs font-bold uppercase text-gray-500"
                >
                    Уровень
                </label>
                <LevelPicker fieldClass={FIELD} />
            </div>

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
                    className={FIELD}
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
                    className={FIELD}
                />
                <span className="mt-1 block text-xs text-gray-500">
                    Только YouTube. Без видео заявку не проверить
                </span>
            </label>

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Комментарий
                </span>
                <textarea name="comment" rows={3} maxLength={500} className={FIELD} />
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
                    className={FIELD}
                />
                <span className="mt-1 block text-xs text-gray-500">
                    Необязательно. Нужно, только если у нас возникнут вопросы
                </span>
            </label>

            <div className="border-t border-gray-200 pt-4">
                <button
                    type="submit"
                    disabled={inProgress}
                    className="rounded bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                >
                    {inProgress ? 'Отправляю…' : 'Отправить заявку'}
                </button>
                <p className="mt-3 text-xs text-gray-500">
                    Заявку посмотрит человек. На сайте она появится только после проверки —
                    обычно в течение пары дней.
                </p>
            </div>
        </form>
    );
}
