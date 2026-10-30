export function Hint({ text }: { text: string }) {
    return (
        <span
            title={text}
            aria-label={text}
            tabIndex={0}
            className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-gray-300 align-middle text-[10px] font-bold text-white transition-colors hover:bg-orange-600"
        >
            ?
        </span>
    );
}

export const SECRET = {
    points:
        'Очки за прохождение уровня. Чем выше уровень в списке, тем больше очков он даёт. Сумма очков определяет место игрока в общем рейтинге.',
    requirement:
        'Минимальный процент прохождения, который засчитывается в список. Например 66% означает, что рекорд от 66% и выше уже попадёт в статистику.',
    verifier:
        'Игрок, который первым прошёл уровень целиком и подтвердил, что уровень вообще проходим.',
    builder: 'Автор уровня — тот, кто его построил в редакторе Geometry Dash.',
    position: 'Место в списке. Первый номер — самый сложный уровень.',
    extended:
        'Уровни ниже 150 места входят в расширенный список (Extended List). Очки они приносят, но заметно меньше: около 4.6 сразу после 150 места и порядка 0.05 в самом конце списка.',
} as const;
