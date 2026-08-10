import { SiteHeader } from '@/src/components/SiteHeader';
import { SiteFooter } from '@/src/components/SiteFooter';

/**
 * Оболочка публичной части: шапка с навигацией и футер.
 *
 * Папка называется (site) в скобках — это «группа маршрутов». Скобки
 * означают, что в адресе она не появляется: файл (site)/levels/page.tsx
 * по-прежнему открывается по /levels, а не по /(site)/levels.
 *
 * Нужно это ровно затем, чтобы у публичной части и админки были разные
 * оболочки. Раньше шапка сайта жила в корневом layout и лезла поверх
 * админки, где ей делать нечего.
 */
export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-black">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
        </div>
    );
}
