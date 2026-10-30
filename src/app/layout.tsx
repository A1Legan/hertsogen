import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

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
            <body className="bg-neutral-50 font-sans">{children}</body>
        </html>
    );
}
