import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

/**
 * Корневая оболочка. Тут только то, что общее вообще для всего:
 * html, body, шрифт.
 *
 * Шапка и футер сайта переехали в (site)/layout.tsx, потому что админке
 * они не нужны — у неё своя оболочка в admin/layout.tsx.
 *
 * Montserrat подставляем прямо в --font-sans: shadcn завёл эту переменную
 * и указал на неё в @layer base, то есть она управляет шрифтом всего
 * проекта. Проще положить в неё нужный шрифт, чем спорить в каждом месте.
 */
const montserrat = Montserrat({
    variable: '--font-sans',
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '700', '900'],
    display: 'swap',
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
        <html lang="ru" className={`${montserrat.variable} antialiased`}>
            {/*
                Фон здесь нейтральный, а не чёрный. Чёрный — это оформление
                публичной части, он задаётся в (site)/layout.tsx. Раньше он
                стоял тут и просвечивал сквозь админку, отчего её цвета
                выглядели грязными.
            */}
            <body className="bg-neutral-50 font-sans">{children}</body>
        </html>
    );
}
