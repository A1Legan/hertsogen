import { writeFile } from 'node:fs/promises';

const all = [];
let offset = 0;

while (true) {
  const url = `https://api.demonlist.org/leaderboard/user/list?limit=50&offset=${offset}`;

  const res = await fetch(url);
  const json = await res.json();
  const users = json.data.users;

  console.log(`страница ${offset / 50 + 1} из ~255 (offset=${offset}) → ${users.length}`);

  if (users.length === 0) break;

  for (const u of users) {
    all.push(u);
  }

  offset += 50;

  if (offset >= 20000) break;
  await new Promise((r) => setTimeout(r, 300));
}
const итог = { data: { users: all } };

await writeFile('sample-users.json', JSON.stringify(итог, null, 2));

console.log(`\nсохранил ${all.length} игроков в sample-users.json`);
