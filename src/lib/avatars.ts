import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Аватарки игроков.
 *
 * В API их нет — это файлы, собранные вручную. В старом сайте они лежали
 * в images/profiles/ и назывались по id игрока: Bez16498.png
 *
 * Список файлов читаем с диска ОДИН раз при запуске, а не для каждого
 * из 12726 игроков. Дальше проверка наличия — это поиск в Set, мгновенный.
 *
 * Проверяем на сервере во время сборки, а не подставляем запасную картинку
 * по ошибке загрузки: так в браузер не улетает ни одного запроса в никуда,
 * и не нужен клиентский компонент.
 */

const ПАПКА = path.join(process.cwd(), 'public', 'images', 'profiles');

const ЗАПАСНАЯ = '/default-profile.png';

const доступные: Set<string> = existsSync(ПАПКА)
    ? new Set(readdirSync(ПАПКА))
    : new Set();

/** Путь к аватарке игрока или к заглушке, если своей нет. */
export function avatarUrl(playerId: number): string {
    const файл = `Bez${playerId}.png`;
    return доступные.has(файл) ? `/images/profiles/${файл}` : ЗАПАСНАЯ;
}

/** Есть ли у игрока своя аватарка (а не заглушка). */
export function hasAvatar(playerId: number): boolean {
    return доступные.has(`Bez${playerId}.png`);
}
