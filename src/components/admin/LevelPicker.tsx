'use client';

import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';

/**
 * Выбор уровня по названию для формы рейтинга.
 *
 * Зачем нужен. В базе мы храним id уровня — число вроде 4284013. По имени
 * хранить нельзя: уровни переименовывают, и запись однажды перестала бы
 * совпадать. Но вводить это число руками невозможно — никто его не знает.
 *
 * Поэтому: человек печатает название, видит совпадения, выбирает нужное,
 * а в форму уходит id. Хранение остаётся правильным, работа — человеческой.
 *
 * Список уровней приезжает целиком, поиск идёт в браузере. Это осознанно:
 * 1808 записей по три поля — примерно как средняя картинка, зато совпадения
 * появляются мгновенно и без обращений к серверу на каждую букву. В админке,
 * куда заходит один человек, это выгодный размен.
 */

export type ВариантУровня = {
    id: number;
    name: string;
    /** Место в Global Demonlist — помогает отличить одноимённые уровни */
    position: number;
    builder: string;
};

export function LevelPicker({
    уровни,
    выбранный,
}: {
    уровни: ВариантУровня[];
    /** Уже выбранный уровень — при правке существующей записи */
    выбранный?: ВариантУровня;
}) {
    const [выбор, setВыбор] = useState<ВариантУровня | null>(выбранный ?? null);
    const [текст, setТекст] = useState('');

    const совпадения = useMemo(() => {
        const запрос = текст.trim().toLowerCase();
        if (запрос.length < 2) return []; // на одну букву подсказок слишком много

        return уровни
            .filter(
                (у) =>
                    у.name.toLowerCase().includes(запрос) ||
                    у.builder.toLowerCase().includes(запрос),
            )
            .slice(0, 8); // больше восьми строк уже не читают, а выбирают наугад
    }, [текст, уровни]);

    // Выбранный уровень уехал — уровень выбран
    if (выбор) {
        return (
            <div className="space-y-2">
                <Label>Уровень</Label>

                {/*
                    Скрытое поле — то, что реально уйдёт на сервер.
                    Видимая часть ниже нужна только человеку.
                */}
                <input type="hidden" name="levelId" value={выбор.id} />

                <div className="flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2.5">
                    <Check className="size-4 flex-shrink-0 text-green-600" />

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{выбор.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                            {выбор.builder} • в Global Demonlist #{выбор.position} • id{' '}
                            {выбор.id}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setВыбор(null);
                            setТекст('');
                        }}
                        aria-label="Выбрать другой уровень"
                        className="flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label htmlFor="поиск-уровня">Уровень</Label>

            <Input
                id="поиск-уровня"
                value={текст}
                onChange={(e) => setТекст(e.target.value)}
                placeholder="Начните печатать название или автора"
                autoComplete="off"
            />

            {текст.trim().length >= 2 && совпадения.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    Ничего не нашлось. Уровень должен быть в списке Global Demonlist —
                    свои добавить нельзя, названия и превью берутся оттуда.
                </p>
            )}

            {совпадения.length > 0 && (
                <ul className="divide-y rounded-md border">
                    {совпадения.map((у) => (
                        <li key={у.id}>
                            <button
                                type="button"
                                onClick={() => setВыбор(у)}
                                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent"
                            >
                                <span className="w-10 flex-shrink-0 text-xs font-bold text-muted-foreground">
                                    #{у.position}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium">
                                        {у.name}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {у.builder}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <p className="text-xs text-muted-foreground">
                Уровень нужно именно выбрать из списка: пока он не выбран, id в форму
                не подставлен, и действие откажет с ошибкой.
            </p>
        </div>
    );
}
