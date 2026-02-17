const fs = require('fs');
const path = require('path');
const db = require('../../models');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../../.env') });
const CONTENT_DIR = path.join(__dirname, '../../../content/courses');

function normalizeLevel(level) {
  if (!level) return 'beginner';
  const normalized = level.toString().toLowerCase();
  if (['beginner', 'intermediate', 'advanced'].includes(normalized)) {
    return normalized;
  }
  return 'beginner';
}

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
        continue;
      }

      let metadata;
      try {
        const rawMetadata = fs.readFileSync(metadataPath, 'utf-8').replace(/^\uFEFF/, '');
        metadata = JSON.parse(rawMetadata);
      } catch {
        continue;
      }

      if (!metadata.title) {
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
      }
    }

    process.exit(0);

  } catch (err) {
    process.exit(1);
  }
}

syncCourses();
