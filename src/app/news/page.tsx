import type { Metadata } from 'next';
import { getNews } from '@/src/lib/news';
import { Shell, PageHeading } from '@/src/components/Shell';

export const metadata: Metadata = {
    title: 'Новости',
    description: 'Новости демонлиста и сайта H&CR.',
};

/** Новости живут в своей БД и меняются чаще списка — обновляем раз в 10 минут. */
export const revalidate = 600;

export default async function NewsPage() {
    const news = await getNews();

    return (
        <Shell>
            <PageHeading title="Новости" />

            <div className="p-4 sm:p-6">
                {news.map((n, index) => (
                    <article
                        key={n.id}
                        id={`news-${n.id}`}
                        style={{ animationDelay: `${Math.min(index, 20) * 35}ms` }}
                        className="animate-card-entry mb-6 border border-gray-200 bg-white shadow-sm"
                    >
                        <div className="p-5">
                            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-orange-600">
                                {n.category} • {n.date}
                            </div>
                            <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                {n.title}
                            </h2>
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
