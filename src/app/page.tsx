import Link from 'next/link';
import { getNews } from '@/src/lib/news';
import { Shell } from '@/src/components/Shell';

export const revalidate = 600;

export default async function HomePage() {
    const news = await getNews();

    return (
        <Shell>
            {/* Блок «что это за сайт» — для человека, который зашёл впервые
                и не понимает, куда попал. Это заявленный приоритет проекта. */}
            <section className="border-b border-gray-200 bg-gray-50 px-4 py-8 sm:px-6">
                <h1 className="mb-3 text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
                    Демонлист, понятный новичку
                </h1>
                <p className="mb-5 max-w-2xl leading-relaxed text-gray-700">
                    Здесь собраны самые сложные уровни Geometry Dash и рейтинг игроков, которые их
                    проходят. В отличие от других списков, мы объясняем, что означает каждая
                    цифра — наведите на знак вопроса рядом с любым числом.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/levels"
                        className="rounded bg-orange-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-orange-700"
                    >
                        Список уровней
                    </Link>
                    <Link
                        href="/players"
                        className="rounded bg-black px-5 py-2.5 font-bold text-white transition-colors hover:bg-gray-800"
                    >
                        Рейтинг игроков
                    </Link>
                    <Link
                        href="/rating-info"
                        className="rounded border border-gray-300 bg-white px-5 py-2.5 font-bold text-gray-800 transition-colors hover:border-gray-500"
                    >
                        Как всё устроено
                    </Link>
                </div>
            </section>

            <div className="p-4 sm:p-6">
                <h2 className="mb-4 text-sm font-bold uppercase text-gray-500">Последние новости</h2>

                {news.map((n, index) => (
                    <article
                        key={n.id}
                        style={{ animationDelay: `${Math.min(index, 20) * 35}ms` }}
                        className="animate-card-entry mb-6 border border-gray-200 bg-white shadow-sm"
                    >
                        <div className="p-5">
                            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-orange-600">
                                {n.category} • {n.date}
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900">{n.title}</h3>
                            <p className="whitespace-pre-line leading-relaxed text-gray-700">
                                {n.text}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </Shell>
    );
}
