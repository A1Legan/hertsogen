import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell } from '@/src/components/Shell';

export const metadata: Metadata = {
    title: 'Заявка отправлена',
    robots: { index: false },
};

export default function SubmitDonePage() {
    return (
        <Shell>
            <div className="p-6 sm:p-12">
                <div className="mx-auto max-w-md text-center">
                    <div className="mb-4 text-4xl">✓</div>

                    <h1 className="mb-3 text-2xl font-black uppercase text-gray-900">
                        Заявка отправлена
                    </h1>

                    <p className="mb-6 leading-relaxed text-gray-600">
                        Спасибо. Мы посмотрим видео и, если всё сходится, добавим рекорд в
                        список — обычно в течение пары дней.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/streams"
                            className="rounded bg-black px-5 py-2.5 font-bold text-white transition-colors hover:bg-gray-800"
                        >
                            К списку рекордов
                        </Link>
                        <Link
                            href="/submit"
                            className="rounded border border-gray-300 bg-white px-5 py-2.5 font-bold text-gray-800 transition-colors hover:border-gray-500"
                        >
                            Отправить ещё
                        </Link>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
