import Link from 'next/link';
import { Newspaper, Radio, ListOrdered, LayoutDashboard, LogOut, ExternalLink } from 'lucide-react';
import { auth, signOut } from '@/src/auth';
import { Button } from '@/src/components/ui/button';
import { Toaster } from '@/src/components/ui/sonner';

/**
 * Оболочка админки: боковое меню, шапка с почтой, выход.
 *
 * Лежит отдельным layout.tsx, поэтому применяется ко всем страницам
 * внутри /admin автоматически — писать меню на каждой не нужно.
 *
 * Страница входа тоже сюда попадает, но там сессии ещё нет,
 * поэтому меню просто не рисуется.
 */

const РАЗДЕЛЫ = [
    { href: '/admin', label: 'Обзор', icon: LayoutDashboard },
    { href: '/admin/news', label: 'Новости', icon: Newspaper },
    { href: '/admin/streams', label: 'Стримы', icon: Radio },
    { href: '/admin/ranking', label: 'Свой рейтинг', icon: ListOrdered },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const сессия = await auth();

    if (!сессия?.user) {
        // Не вошли — значит это страница входа, показываем её как есть
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
                <aside className="hidden w-52 flex-shrink-0 md:block">
                    <div className="mb-6 px-3">
                        <div className="text-lg font-black tracking-tight">
                            H<span className="text-orange-600">&amp;</span>CR
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            {сессия.user.email}
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {РАЗДЕЛЫ.map((р) => (
                            <Link
                                key={р.href}
                                href={р.href}
                                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <р.icon className="size-4" />
                                {р.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-6 space-y-1 border-t pt-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <ExternalLink className="size-4" />
                            На сайт
                        </Link>

                        <form
                            action={async () => {
                                'use server';
                                await signOut({ redirectTo: '/' });
                            }}
                        >
                            <Button
                                type="submit"
                                variant="ghost"
                                className="w-full justify-start gap-2.5 px-3 text-muted-foreground"
                            >
                                <LogOut className="size-4" />
                                Выйти
                            </Button>
                        </form>
                    </div>
                </aside>

                <main className="min-w-0 flex-1">{children}</main>
            </div>

            {/* Всплывающие уведомления «сохранено», «удалено» */}
            <Toaster position="bottom-right" />
        </div>
    );
}
