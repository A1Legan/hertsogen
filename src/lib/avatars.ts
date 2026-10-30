import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const FOLDER = path.join(process.cwd(), 'public', 'images', 'profiles');

const SECOND = '/default-profile.png';

const allowed: Set<string> = existsSync(FOLDER)
    ? new Set(readdirSync(FOLDER))
    : new Set();

export function avatarUrl(playerId: number): string {
    const file = `Bez${playerId}.png`;
    return allowed.has(file) ? `/images/profiles/${file}` : SECOND;
}

export function hasAvatar(playerId: number): boolean {
    return allowed.has(`Bez${playerId}.png`);
}
