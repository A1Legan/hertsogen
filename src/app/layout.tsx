import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/src/components/SiteHeader';
import { SiteFooter } from '@/src/components/SiteFooter';

const montserrat = Montserrat({
    variable: '--font-montserrat',
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '700', '900'],
});

export const metadata: Metadata = {
    title: {
        default: 'H&CR — демонлист Geometry Dash',
        template: '%s | H&CR',
    },
    description:
        'Список сложнейших демонов Geometry Dash и рейтинг игроков. Понятно объясняем, что означает каждая цифра.',
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ru" className={`${montserrat.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col bg-black font-sans">
                <SiteHeader />
                <div className="flex-1">{children}</div>
                <SiteFooter />
            </body>
        </html>
    );
}
