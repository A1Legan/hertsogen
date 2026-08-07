import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell, PageHeading } from '@/src/components/Shell';

export const metadata: Metadata = {
    title: 'Как всё устроено',
    description: 'Что такое демонлист, очки, requirement и extended list — объяснение для новичка.',
};

/**
 * Ключевая страница для главной цели проекта: объяснить новичку, что тут вообще
 * происходит. Всё написано простым языком, без жаргона, каждый термин раскрыт.
 */
export default function RatingInfoPage() {
    return (
        <Shell>
            <PageHeading
                title="Как всё устроено"
                subtitle="Короткое объяснение для тех, кто здесь впервые."
            />

            <div className="space-y-8 p-4 sm:p-6">
                <Section title="Что такое демонлист">
                    Список сложнейших уровней Geometry Dash, выстроенных по сложности. На первом
                    месте — самый трудный уровень из существующих. Позиции определяет сообщество
                    игроков, которые эти уровни реально проходят.
                </Section>

                <Section title="Очки (points)">
                    За прохождение уровня игрок получает очки. Чем выше уровень в списке, тем
                    больше очков он даёт: первое место стоит 1000, а уровень в районе сотого
                    места — уже около 100. Сумма очков за все пройденные уровни определяет место
                    игрока в общем рейтинге.
                </Section>

                <Section title="Requirement — сколько нужно пройти">
                    Не обязательно проходить уровень целиком, чтобы попасть в статистику. У
                    каждого уровня есть минимальный процент: например 66% означает, что рекорд
                    от 66% и выше уже засчитывается. Чем ниже уровень в списке, тем выше
                    требование — у самых лёгких оно доходит до 100%.
                </Section>

                <Section title="Extended list — расширенный список">
                    Первые 150 мест — основной список, они приносят очки. Всё, что ниже 150-го
                    места, называется расширенным списком: уровни там тоже сложные и они честно
                    отслеживаются, но очков в общий рейтинг не дают.
                </Section>

                <Section title="Verifier — верификатор">
                    Игрок, который первым прошёл уровень целиком. До этого момента считается, что
                    уровень в принципе может оказаться непроходимым. Верификация — это
                    доказательство, что уровень реально можно пройти.
                </Section>

                <Section title="Holder — автор">
                    Тот, кто построил уровень в редакторе. Автор и верификатор — обычно разные
                    люди: создать сложный уровень и пройти его требует совсем разных навыков.
                </Section>

                <div className="border-l-4 border-orange-600 bg-orange-50 p-4 text-sm text-gray-700">
                    Данные списка мы берём из{' '}
                    <a
                        href="https://demonlist.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-orange-700 underline"
                    >
                        Global Demonlist
                    </a>
                    . Список обновляется несколько раз в месяц, наш сайт подтягивает изменения
                    автоматически.
                </div>

                <Link
                    href="/levels"
                    className="block rounded bg-black px-6 py-3 text-center font-bold text-white transition-colors hover:bg-gray-800"
                >
                    Перейти к списку уровней
                </Link>
            </div>
        </Shell>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="mb-2 text-lg font-bold text-gray-900">{title}</h2>
            <p className="leading-relaxed text-gray-700">{children}</p>
        </section>
    );
}
