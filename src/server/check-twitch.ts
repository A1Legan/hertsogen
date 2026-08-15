/**
 * Проверка ключей Twitch.
 *
 * Client ID и Client Secret выглядят одинаково — тридцать символов
 * латиницы с цифрами. Понять, что есть что, можно только попробовав.
 *
 * Скрипт берёт значения из .env, пробует получить токен, и если не вышло —
 * пробует наоборот. Так мы узнаём порядок фактом, а не догадкой.
 */

const первый = process.env.TWITCH_CLIENT_ID;
const второй = process.env.TWITCH_CLIENT_SECRET;

if (!первый || !второй) {
    console.log('Впиши оба значения в .env, порядок пока любой:');
    console.log('  TWITCH_CLIENT_ID="..."');
    console.log('  TWITCH_CLIENT_SECRET="..."');
    process.exit(1);
}

async function попробовать(id: string, secret: string): Promise<string | null> {
    const res = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: id,
            client_secret: secret,
            grant_type: 'client_credentials',
        }),
    });

    if (!res.ok) return null;

    const данные = await res.json();
    return данные.access_token ?? null;
}

console.log('Пробую как есть...');

if (await попробовать(первый, второй)) {
    console.log('\n  Порядок верный, ничего менять не надо.');
    console.log('  Twitch выдал токен — ключи рабочие.');
} else {
    console.log('Не вышло. Пробую наоборот...');

    if (await попробовать(второй, первый)) {
        console.log('\n  Значения перепутаны местами — поменяй их в .env.');
        console.log('  То, что сейчас в TWITCH_CLIENT_ID, должно быть в SECRET, и наоборот.');
    } else {
        console.log('\n  Не работает ни так, ни так.');
        console.log('  Скорее всего секрет устарел: Twitch показывает его один раз,');
        console.log('  и при создании нового старый перестаёт действовать.');
        console.log('  Попроси владельца нажать New Secret и прислать свежий.');
    }
}
