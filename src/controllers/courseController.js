const fs = require('fs');
const path = require('path');
const db = require('../models');

exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await db.Course.findOne({
      where: { slug },
      include: [
        {
          model: db.Module,
          as: 'modules',
          order: [['order', 'ASC']],
          include: [
            {
              model: db.Lesson,
              as: 'lessons',
              order: [['order', 'ASC']]
            }
          ]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await db.Course.findAll({
      attributes: ['id', 'title', 'slug', 'description', 'category', 'level']
    });

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLessonContent = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await db.Lesson.findByPk(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const lessons = await db.Lesson.findAll({
      where: { module_id: lesson.module_id },
      order: [['order', 'ASC']]
    });

    const index = lessons.findIndex(l => l.id === lesson.id);

    const prev = index > 0 ? lessons[index - 1].id : null;
    const next = index < lessons.length - 1 ? lessons[index + 1].id : null;

    const fullPath = path.join(__dirname, '../../', lesson.content_path);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Markdown file not found' });
    }

    const markdown = fs.readFileSync(fullPath, 'utf-8');

    res.json({
      id: lesson.id,
      title: lesson.title,
      content: markdown,
      prev,
      next
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
