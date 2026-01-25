const fs = require('fs');
const path = require('path');
const db = require('../models');

const CONTENT_DIR = path.join(__dirname, '../../content/courses');

function parseOrderFromFilename(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function titleFromFilename(filename) {
  return filename
    .replace(/^\d+-?/, '')     // прибрати номер
    .replace(/\.md$/, '')      // прибрати .md
    .replace(/-/g, ' ')        // дефіси → пробіли
    .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize
}

async function syncLessons() {
  try {
    await db.sequelize.sync();

    const courseDirs = fs
      .readdirSync(CONTENT_DIR, { withFileTypes: true })
      .filter(dir => dir.isDirectory())
      .map(dir => dir.name);

    for (const courseSlug of courseDirs) {
      const course = await db.Course.findOne({
        where: { slug: courseSlug }
      });

      if (!course) {
        console.warn(`⚠️ Course not found in DB: ${courseSlug}`);
        continue;
      }

      // 🔹 Створюємо єдиний Module 1
      const [module] = await db.Module.findOrCreate({
        where: {
          course_id: course.id,
          order: 1
        },
        defaults: {
          title: 'Основи'
        }
      });

      const lessonsDir = path.join(CONTENT_DIR, courseSlug, 'modules', 'Lesson');

      if (!fs.existsSync(lessonsDir)) {
        console.warn(`⚠️ No modules folder for ${courseSlug}`);
        continue;
      }

      const lessonFiles = fs
        .readdirSync(lessonsDir)
        .filter(file => file.endsWith('.md'));

      for (const file of lessonFiles) {
        const order = parseOrderFromFilename(file);
        const title = titleFromFilename(file);
        const contentPath = path.join(
            'content',
            'courses',
            courseSlug,
            'modules',
            'Lesson',
            file
        );

        const [lesson, created] = await db.Lesson.findOrCreate({
          where: {
            module_id: module.id,
            order
          },
          defaults: {
            title,
            content_path: contentPath,
            type: 'text'
          }
        });

        if (!created) {
          await lesson.update({
            title,
            content_path: contentPath
          });

          console.log(`🔄 Updated lesson ${order}: ${title}`);
        } else {
          console.log(`✅ Created lesson ${order}: ${title}`);
        }
      }
    }

    console.log('🎉 Lessons sync completed successfully');
    process.exit(0);

  } catch (err) {
    console.error('❌ Lessons sync error:', err);
    process.exit(1);
  }
}

syncLessons();
