import { prisma } from '../lib/prisma';

// Создаём новость так же, как это будет делать админка: через Prisma Client.
// Поле id не указываем вовсе — пусть подставит сам.

const созданная = await prisma.news.create({
    data: {
        title: 'Проверка связи',
        category: 'Тест',
        text: 'Если вы видите это на сайте — база, Prisma и вёрстка работают вместе.',
        published: true,
    },
});

console.log('создана новость');
console.log('  id:  ', созданная.id);
console.log('  дата:', созданная.date);

console.log('\nвсего опубликованных новостей:', await prisma.news.count({ where: { published: true } }));
