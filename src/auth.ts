import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const allowed = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],

    callbacks: {
        async signIn({ profile }) {
            const email = profile?.email?.toLowerCase();

            if (!email) return false;

            if (!profile?.email_verified) return false;

            return allowed.includes(email);
        },
    },

    pages: {
        signIn: '/admin/login',
        error: '/admin/login',
    },
});
