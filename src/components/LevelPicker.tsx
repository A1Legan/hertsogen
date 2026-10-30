'use client';

import { useEffect, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

export type LevelVariant = {
    id: number;
    name: string;
    position: number;
    builder: string;
    requirement?: number;
};

export function LevelPicker({
    chosed,
    fieldClass,
    id = 'поиск-уровня',
}: {
    chosed?: LevelVariant;
    fieldClass?: string;
    id?: string;
}) {
    const [chose, setChose] = useState<LevelVariant | null>(chosed ?? null);
    const [text, setText] = useState('');
    const [coincidences, setCoincidences] = useState<LevelVariant[]>([]);
    const [seach, setSearch] = useState(false);

    useEffect(() => {
        const request = text.trim();

        if (request.length < 2) {
            setCoincidences([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearch(true);
            try {
                const answer = await fetch(`/api/levels/search?q=${encodeURIComponent(request)}`);
                setCoincidences(answer.ok ? await answer.json() : []);
            } catch {
                setCoincidences([]);
            } finally {
                setSearch(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [text]);

    if (chose) {
        return (
            <div className="space-y-1.5">
                <input type="hidden" name="levelId" value={chose.id} />
                <input type="hidden" name="levelName" value={chose.name} />

                <div className="flex items-center gap-3 border border-gray-300 bg-gray-50 px-3 py-2.5">
                    <Check className="size-4 flex-shrink-0 text-green-600" />

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-gray-900">
                            {chose.name}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                            {chose.builder} • место #{chose.position}
                            {chose.requirement != null && ` • нужно ${chose.requirement}%`}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setChose(null);
                            setText('');
                        }}
                        aria-label="Выбрать другой уровень"
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <div className="relative">
                <input
                    id={id}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Начните печатать название"
                    autoComplete="off"
                    className={fieldClass}
                />
                {seach && (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
            </div>

            {text.trim().length >= 2 && !seach && coincidences.length === 0 && (
                <p className="text-xs text-gray-500">
                    Ничего не нашлось. Уровень должен быть в списке Global Demonlist.
                </p>
            )}

            {coincidences.length > 0 && (
                <ul className="divide-y divide-gray-200 border border-gray-300 bg-white">
                    {coincidences.map((y) => (
                        <li key={y.id}>
                            <button
                                type="button"
                                onClick={() => setChose(y)}
                                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
                            >
                                <span className="w-10 flex-shrink-0 text-xs font-bold text-gray-400">
                                    #{y.position}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-bold text-gray-900">
                                        {y.name}
                                    </span>
                                    <span className="block truncate text-xs text-gray-500">
                                        {y.builder}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <p className="text-xs text-gray-500">
                Уровень нужно выбрать из подсказок — иначе форма не будет знать,
                о каком именно уровне речь.
            </p>
        </div>
    );
}
