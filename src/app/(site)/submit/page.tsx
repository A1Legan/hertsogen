import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell, PageHeading } from '@/src/components/Shell';
import { SubmitForm } from '@/src/components/SubmitForm';

export const metadata: Metadata = {
    title: 'Отправить рекорд',
    description: 'Прошли сложный демон или показали хороший процент — расскажите нам.',
};

/** Форма всегда свежая: кэшировать нечего, данных она не читает. */
export const dynamic = 'force-dynamic';

export default function SubmitPage() {
    return (
        <Shell>
            <PageHeading
                title="Отправить рекорд"
                subtitle="Прошли сложный уровень или показали хороший процент — расскажите, добавим в список."
            />

            <div className="p-4 sm:p-6">
                <div className="mb-6 border-l-4 border-orange-300 bg-orange-50 px-4 py-3 text-sm text-gray-700">
                    Вещаете прохождение и хотите попасть в список стримов?{' '}
                    <Link href="/submit/stream" className="font-bold text-orange-700 underline">
                        Другая форма
                    </Link>
                </div>

                <SubmitForm />
            </div>
        </Shell>
    );
}
