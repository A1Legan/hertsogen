import { readFile } from 'node:fs/promises';

const testAnswer = JSON.parse(await readFile('sample-users.json', 'utf-8'));
const users = testAnswer.data.users;

console.log(`Проверка всех ${users.length} игроков! \n`);

const allKeys = new Set<string>();

for (const lvl of users) 
for (const k of Object.keys(lvl)) 
    allKeys.add(k);

for (const key of allKeys) {
    let missing = 0, nulls = 0, empty = 0;
    const types = new Set<string>();

    for (const lvl of users) {
        if (!(key in lvl))     { missing++; continue; }
        if (lvl[key] === null) { nulls++; continue; }
        if (lvl[key] === '')   { empty++; }
        types.add(typeof lvl[key]);
    }

    console.log(
        key.padEnd(18),
        'Виды дыр:', [...types].join('|').padEnd(10),
        'Нет такого поля:', String(missing).padEnd(5),
        'Поле вернуло null:', String(nulls).padEnd(5),
        'Просто пустая строка:', empty
    )
}

export {};