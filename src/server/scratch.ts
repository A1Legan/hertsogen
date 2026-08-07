import { writeFile } from 'node:fs/promises';

const answer = await fetch('https://api.demonlist.org/level/classic/list');
console.log(`Ответ от Global List: ${answer.status}`);

const body = await answer.json();

console.log('Внешний уровень:', Object.keys(body));
console.log('Внутри data:', Object.keys(body.data));
console.log('Всего уровней:', body.data.levels.length);
console.log('Топ-1:', body.data.levels[0]);

export {}

await writeFile('sample-levels.json', JSON.stringify(body, null, 2));
console.log('Сохранил в sample-levels.json');