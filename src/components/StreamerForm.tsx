'use client';

import { useActionState } from 'react';
import {
    sendStreamerMessage,
    type FormStatus,
} from '@/src/app/(site)/submit/stream/actions';
import { COUNTRY_NAME, haveCountry } from '@/src/lib/countries';
import { LevelPicker } from './LevelPicker';

const ПОЛЕ =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none';

export function StreamerForm() {
    const [status, send, inProgress] = useActionState<FormStatus, FormData>(
        sendStreamerMessage,
        undefined,
    );

    return (
        <form action={send} className="space-y-5">
            <input type="hidden" name="открытоВ" value={Date.now()} />

            <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website-s">Сайт</label>
                <input id="website-s" name="website" type="text" tabIndex={-1} autoComplete="off" />
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
                    <input name="playerName" required maxLength={60} className={ПОЛЕ} />
                </label>

                <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                        Страна
                    </span>
                    <select name="playerCountry" defaultValue="Unknown" className={ПОЛЕ}>
                        <option value="Unknown">— не указывать —</option>
                        {COUNTRY_NAME.map((c) => (
                            <option key={c} value={c}>
                                {haveCountry(c)}
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
                <div className="block">
                    <label
                        htmlFor="поиск-уровня"
                        className="mb-1 block text-xs font-bold uppercase text-gray-500"
                    >
                        Какой уровень проходите
                    </label>
                    <LevelPicker fieldClass={ПОЛЕ} />
                </div>

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
                    disabled={inProgress}
                    className="rounded bg-orange-600 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                >
                    {inProgress ? 'Отправляю…' : 'Отправить заявку'}
                </button>
            </div>
        </form>
    );
}
