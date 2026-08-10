import { handlers } from '@/src/auth';

/**
 * Точка входа для всех запросов авторизации.
 *
 * [...nextauth] в имени папки — «поймать всё, что начинается с этого пути».
 * Сюда приходят /api/auth/signin, /api/auth/callback/google, /api/auth/signout
 * и остальное. Разбирается с ними сама библиотека, нам писать нечего.
 */
export const { GET, POST } = handlers;
