const fs = require('fs');
const path = require('path');
const db = require('../models');

const CONTENT_DIR = path.join(__dirname, '../../content/courses');

/**
 * Нормалізація level під ENUM у БД
 * Допустимі значення:
 * 'beginner' | 'intermediate' | 'advanced'
 */
function normalizeLevel(level) {
  if (!level) return 'beginner';

  const normalized = level.toString().toLowerCase();

  if (['beginner', 'intermediate', 'advanced'].includes(normalized)) {
    return normalized;
  }

  console.warn(`⚠️ Unknown level "${level}", fallback to "beginner"`);
  return 'beginner';
}

/**
 * Нормалізація category (ENUM нема, але тримаємо стандарт)
 */
function normalizeCategory(category) {
  if (!category) return null;
  return category.toString().toLowerCase();
}

async function syncCourses() {
  try {
    await db.sequelize.sync();

    if (!fs.existsSync(CONTENT_DIR)) {
      throw new Error(`Content directory not found: ${CONTENT_DIR}`);
    }

    const courseDirs = fs
      .readdirSync(CONTENT_DIR, { withFileTypes: true })
      .filter(dir => dir.isDirectory())
      .map(dir => dir.name);

    for (const slug of courseDirs) {
      const metadataPath = path.join(CONTENT_DIR, slug, 'metadata.json');

      if (!fs.existsSync(metadataPath)) {
        console.warn(`⚠️ metadata.json not found for "${slug}", skipped`);
        continue;
      }

      let metadata;
      try {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      } catch (err) {
        console.error(`❌ Invalid JSON in ${metadataPath}`);
        continue;
      }

      if (!metadata.title) {
        console.warn(`⚠️ Course "${slug}" has no title, skipped`);
        continue;
      }

      const level = normalizeLevel(metadata.level);
      const category = normalizeCategory(metadata.category);

      const [course, created] = await db.Course.findOrCreate({
        where: { slug },
        defaults: {
          title: metadata.title,
          description: metadata.description || '',
          category,
          level,
          price: Number(metadata.price) || 0,
          thumbnail: metadata.thumbnail || null
        }
      });

      if (!created) {
        await course.update({
          title: metadata.title,
          description: metadata.description || '',
          category,
          level,
          price: Number(metadata.price) || 0,
          thumbnail: metadata.thumbnail || null
        });

        console.log(`🔄 Updated course: ${slug}`);
      } else {
        console.log(`✅ Created course: ${slug}`);
      }
    }

    console.log('🎉 Courses sync completed successfully');
    process.exit(0);

  } catch (err) {
    console.error('❌ Sync error:', err.message);
    process.exit(1);
  }
}

syncCourses();
