const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const db = require('../models');

class CourseService {
    async getAllCourses() {
        try {
            const courses = await db.Course.findAll({
                include: [{
                    model: db.Module,
                    as: 'modules',
                    include: [{
                        model: db.Lesson,
                        as: 'lessons',
                        attributes: ['id']
                    }]
                }]
            });
            return courses;
        } catch (error) {
            throw error;
        }
    }

    async getCourseBySlug(slug) {
        const course = await db.Course.findOne({
            where: { slug },
            include: [{ model: db.Module, as: 'modules', include: [{ model: db.Lesson, as: 'lessons' }] }]
        });
        return course;
    }

    async getLessonContent(lessonId) {
        const lesson = await db.Lesson.findByPk(lessonId);

        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const lessons = await db.Lesson.findAll({
            where: { module_id: lesson.module_id },
            order: [['order', 'ASC']]
        });

        const index = lessons.findIndex(l => l.id === lesson.id);
        const fullPath = path.join(__dirname, '../../', lesson.content_path);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Content file not found: ${lesson.content_path}`);
        }

        try {
            const rawMarkdown = fs.readFileSync(fullPath, 'utf-8');
            const htmlContent = marked.parse(rawMarkdown);

            return {
                id: lesson.id,
                title: lesson.title,
                content: htmlContent,
                prev: index > 0 ? lessons[index - 1].id : null,
                next: index < lessons.length - 1 ? lessons[index + 1].id : null
            };
        } catch {
            throw new Error('Error processing lesson content');
        }
    }
}

module.exports = new CourseService();
