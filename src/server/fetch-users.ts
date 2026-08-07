import { writeFile } from 'node:fs/promises';

// Скачиваем ВЕСЬ лидерборд. Он отдаётся по 50 игроков за раз,
// поэтому запрашиваем страницу за страницей, пока они не кончатся.

const все = [];
let offset = 0;

while (true) {
  const url = `https://api.demonlist.org/leaderboard/user/list?limit=50&offset=${offset}`;

  const res = await fetch(url);
  const json = await res.json();
  const users = json.data.users;

  console.log(`страница ${offset / 50 + 1} из ~255 (offset=${offset}) → ${users.length}`);

  // Пустая страница = игроки кончились, выходим из цикла
  if (users.length === 0) break;

  for (const u of users) {
    все.push(u);
  }

  offset += 50;

  // Предохранитель: чтобы при неожиданном ответе не крутиться вечно.
  // Аккаунтов ~12726, берём с большим запасом.
  if (offset >= 20000) break;

  // Пауза между запросами, чтобы не словить блокировку
  await new Promise((r) => setTimeout(r, 300));
}

// Складываем в тот же вид, что у API: { data: { users: [...] } }
// чтобы countries.ts читал его так же, как inspect.ts читает уровни
const итог = { data: { users: все } };

await writeFile('sample-users.json', JSON.stringify(итог, null, 2));

console.log(`\nсохранил ${все.length} игроков в sample-users.json`);
