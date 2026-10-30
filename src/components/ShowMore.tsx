'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
export function ShowMore({
    showed: showed,
    more: more,
    step: step,
    amount: amount,
}: {
    showed: number;
    more: boolean;
    step: number;
    amount: string;
}) {
    const params = useSearchParams();
    const path = usePathname();

    if (!more) {
        return (
            <p className="py-6 text-center text-sm text-gray-500">
                Это всё — {showed} {amount}
            </p>
        );
    }

    const newLevels = new URLSearchParams(params);
    newLevels.set('n', String(showed + step));

    return (
        <div className="py-6 text-center">
            <Link
                href={`${path}?${newLevels}`}
                scroll={false}
                className="inline-block border border-gray-300 bg-white px-8 py-3 text-sm font-bold uppercase text-gray-700 transition-colors hover:border-orange-500 hover:text-orange-600"
            >
                Показать ещё
            </Link>
            <p className="mt-2 text-xs text-gray-500">
                Показано {showed} {amount}
            </p>
        </div>
    );
}
