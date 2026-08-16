import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell, PageHeading } from '@/src/components/Shell';
import { StreamerForm } from '@/src/components/StreamerForm';

export const metadata: Metadata = {
    title: 'Попасть в список стримов',
    description: 'Вещаете прохождение сложных демонов — добавим вас в список стримов H&CR.',
};

export const dynamic = 'force-dynamic';

export default function SubmitStreamPage() {
    return (
        <Shell>
            <PageHeading
                title="Попасть в список стримов"
                subtitle="Вещаете прохождение сложного уровня — добавим вас, и зрители будут видеть, когда вы в эфире."
            />

            <div className="p-4 sm:p-6">
                <div className="mb-6 border-l-4 border-orange-300 bg-orange-50 px-4 py-3 text-sm text-gray-700">
                    Прошли уровень и хотите добавить рекорд, а не стрим?{' '}
                    <Link href="/submit" className="font-bold text-orange-700 underline">
                        Другая форма
                    </Link>
                </div>

                <StreamerForm />
            </div>
        </Shell>
    );
}
