'use client';

import { useActionState } from 'react';
import {
    updateYourProgress,
    type checkUpdate,
} from '@/src/app/(site)/update/[token]/actions';

const FIELD =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-lg focus:border-orange-500 focus:outline-none';

export function UpdateProgressForm({
    token,
    levelName,
    progress,
}: {
    token: string;
    levelName: string;
    progress: number;
}) {
    const action = updateYourProgress.bind(null, token);

    const [status, send, inProgress] = useActionState<checkUpdate, FormData>(
        action,
        undefined,
    );

    return (
        <form action={send} className="space-y-5">
            {status?.error && (
                <p className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {status.error}
                </p>
            )}

            {status?.saved && (
                <p className="border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                    Сохранено — на сайте уже обновилось
                </p>
            )}

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Уровень
                </span>
                <input
                    name="levelName"
                    required
                    maxLength={150}
                    defaultValue={levelName}
                    className={FIELD}
                />
            </label>

            <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Ваш процент
                </span>
                <input
                    type="number"
                    name="progress"
                    required
                    min={0}
                    max={100}
                    defaultValue={progress}
                    inputMode="numeric"
                    className={`${FIELD} text-2xl font-bold`}
                />
            </label>

            <button
                type="submit"
                disabled={inProgress}
                className="w-full rounded bg-orange-600 px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
            >
                {inProgress ? 'Сохраняю…' : 'Обновить'}
            </button>
        </form>
    );
}
