'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

export function SearchBox({
    placeholder,
    signature: signature,
}: {
    placeholder: string;
    signature: string;
}) {
    const params = useSearchParams();
    const path = usePathname();
    const router = useRouter();

    const [text, setText] = useState(params.get('q') ?? '');
    const [uploading, start] = useTransition();

    useEffect(() => {
        const inAddress = params.get('q') ?? '';
        if (text === inAddress) return;

        const timer = setTimeout(() => {
            const newNew = new URLSearchParams(params);

            if (text.trim()) newNew.set('q', text.trim());
            else newNew.delete('q');

            newNew.delete('n');

            start(() => {
                router.replace(`${path}?${newNew}`, { scroll: false });
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [text, params, path, router]);

    return (
        <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />

            <input
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                aria-label={signature}
                className="w-full border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm focus:border-orange-500 focus:outline-none"
            />

            {uploading ? (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
            ) : (
                text && (
                    <button
                        type="button"
                        onClick={() => setText('')}
                        aria-label="Очистить поиск"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                    >
                        <X className="size-4" />
                    </button>
                )
            )}
        </div>
    );
}
