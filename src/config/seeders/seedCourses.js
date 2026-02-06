const db = require('../../models');

async function seed() {
  try {
    await db.sequelize.sync();
    await db.Course.findOrCreate({
      where: { slug: 'javascript-basics' },
      defaults: {
        title: 'JavaScript Fundamentals',
        description: 'Базовий курс з JavaScript',
        category: 'frontend',
        level: 'beginner',
        price: 0
      }
    });

    console.log('✅ Course seeded');
    process.exit();
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}
seed();
