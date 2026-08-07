import { getLevels } from '../lib/demonlist';

const levels = await getLevels();

console.log('получено уровней:', levels.length);

console.log('\nтоп-3:');
for (const l of levels.slice(0, 3)) {
  console.log(`  #${l.position} ${l.name} — ${l.points} pts, by ${l.builder}`);
}

const broken = levels.filter((l) => l.videoUrl === null);
console.log('\nбез рабочего видео:', broken.length);
console.log(broken.map((l) => `#${l.position} ${l.name}`).join('\n'));