import { prisma } from '../lib/prisma';

const created = await prisma.news.create({
    data: {
        title: 'Проверка связи',
        category: 'Тест',
        text: 'Если вы видите это на сайте — база, Prisma и вёрстка работают вместе.',
        published: true,
    },
});

console.log('создана новость');
console.log('  id:  ', created.id);
console.log('  дата:', created.date);

console.log('\nвсего опубликованных новостей:', await prisma.news.count({ where: { published: true } }));
