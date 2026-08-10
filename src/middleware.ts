import { auth } from '@/src/auth';
import { NextResponse } from 'next/server';

/**
 * Охрана админки.
 *
 * Middleware выполняется ДО того, как Next начнёт собирать страницу.
 * Это второй рубеж: даже если на какой-то странице внутри /admin забудут
 * проверить вход, сюда запрос всё равно не дойдёт.
 *
 * Полагаться только на то, что «страницы админки никто не знает», нельзя:
 * адреса находятся, а закрытая дверь работает независимо от знания адреса.
 */
export default auth((req) => {
    const залогинен = !!req.auth;
    const путь = req.nextUrl.pathname;

    // Страницу входа пускаем всегда, иначе получится замкнутый круг
    if (путь === '/admin/login') {
        // А залогиненного с неё сразу уводим внутрь
        if (залогинен) {
            return NextResponse.redirect(new URL('/admin', req.nextUrl));
        }
        return NextResponse.next();
    }

    if (!залогинен) {
        return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    // Middleware трогает только админку. Публичные страницы, картинки
    // и статика проходят мимо — иначе каждый запрос стал бы дороже.
    matcher: ['/admin/:path*'],
};
