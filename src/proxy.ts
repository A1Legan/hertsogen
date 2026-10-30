import { auth } from '@/src/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const login = !!req.auth;
    const path = req.nextUrl.pathname;

    if (path === '/admin/login') {
        if (login) {
            return NextResponse.redirect(new URL('/admin', req.nextUrl));
        }
        return NextResponse.next();
    }

    if (!login) {
        return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*'],
};
