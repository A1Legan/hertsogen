import type { Metadata } from 'next';
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
                <SubmitForm />
            </div>
        </Shell>
    );
}
