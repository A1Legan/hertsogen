import type { Metadata } from 'next';
import { signIn } from '@/src/auth';

export const metadata: Metadata = {
    title: 'Вход',
    // Не пускаем страницу входа в поисковики
    robots: { index: false, follow: false },
};

export default function LoginPage() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-sm border border-gray-200 bg-white p-8 text-center shadow-sm">
                <h1 className="mb-2 text-2xl font-black uppercase text-gray-900">
                    H<span className="text-orange-600">&amp;</span>CR
                </h1>
                <p className="mb-6 text-sm text-gray-500">Управление сайтом</p>

                {/*
                    Форма, а не кнопка с onClick: серверное действие работает
                    без единой строчки клиентского JavaScript. Меньше кода —
                    меньше мест, где можно ошибиться.
                */}
                <form
                    action={async () => {
                        'use server';
                        await signIn('google', { redirectTo: '/admin' });
                    }}
                >
                    <button
                        type="submit"
                        className="w-full rounded bg-black px-6 py-3 font-bold text-white transition-colors hover:bg-gray-800"
                    >
                        Войти через Google
                    </button>
                </form>

                <p className="mt-6 text-xs leading-relaxed text-gray-400">
                    Доступ только у тех, чья почта добавлена в список администраторов.
                    Если вход не проходит — значит вашего адреса там нет.
                </p>
            </div>
        </div>
    );
}
