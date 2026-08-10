import type { Metadata } from 'next';
import Link from 'next/link';
import { NewsForm } from '@/src/components/admin/NewsForm';
import { создатьНовость } from '../actions';

export const metadata: Metadata = { title: 'Новая новость', robots: { index: false } };

export default function NewNewsPage() {
    return (
        <div className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6 border-b border-gray-300 pb-4">
                    <Link
                        href="/admin/news"
                        className="text-xs font-bold uppercase text-gray-400 hover:text-orange-600"
                    >
                        ← новости
                    </Link>
                    <h1 className="text-2xl font-black uppercase text-gray-900">Новая новость</h1>
                </div>

                <div className="border border-gray-200 bg-white p-6">
                    <NewsForm action={создатьНовость} />
                </div>
            </div>
        </div>
    );
}
