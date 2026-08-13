'use client';

import { useActionState } from 'react';
import {
    обновитьСвойПрогресс,
    type СостояниеОбновления,
} from '@/src/app/(site)/update/[token]/actions';

const ПОЛЕ =
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
    // Ключ подставляем заранее — форме о нём знать незачем,
    // и в скрытом поле он не поедет, где его видно через инструменты
    const действие = обновитьСвойПрогресс.bind(null, token);

    const [состояние, отправить, вПроцессе] = useActionState<СостояниеОбновления, FormData>(
        действие,
        undefined,
    );

    return (
        <form action={отправить} className="space-y-5">
            {состояние?.ошибка && (
                <p className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {состояние.ошибка}
                </p>
            )}

            {состояние?.сохранено && (
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
                    className={ПОЛЕ}
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
                    className={`${ПОЛЕ} text-2xl font-bold`}
                />
            </label>

            <button
                type="submit"
                disabled={вПроцессе}
                className="w-full rounded bg-orange-600 px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
            >
                {вПроцессе ? 'Сохраняю…' : 'Обновить'}
            </button>
        </form>
    );
}
