const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const db = require('../models');
const CONTENT_DIR = path.join(__dirname, '../../content/courses');

function parseOrderFromFilename(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function titleFromFilename(filename) {
  return filename
      .replace(/^\d+-?/, '')
      .replace(/\.md$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
}

async function syncLessons() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    const courseDirs = fs
        .readdirSync(CONTENT_DIR, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);

    for (const courseSlug of courseDirs) {
      const course = await db.Course.findOne({ where: { slug: courseSlug } });
      if (!course) continue;

      const [module] = await db.Module.findOrCreate({
        where: { course_id: course.id, order: 1 },
        defaults: { title: 'Основи' }
      });

      const lessonsDir = path.join(CONTENT_DIR, courseSlug, 'modules', 'lessons');
      if (!fs.existsSync(lessonsDir)) continue;

      const lessonFiles = fs.readdirSync(lessonsDir).filter(file => file.endsWith('.md'));

      for (const file of lessonFiles) {
        const order = parseOrderFromFilename(file);
        const title = titleFromFilename(file);
        const contentPath = path.join('content', 'courses', courseSlug, 'modules', 'lessons', file);

        const [lesson, created] = await db.Lesson.findOrCreate({
          where: { module_id: module.id, order },
          defaults: { title, content_path: contentPath, type: 'text' }
        });

        if (!created) {
          await lesson.update({ title, content_path: contentPath });
        }
      }
    }

    process.exit(0);
  } catch {
    process.exit(1);
  }
}

syncLessons();
