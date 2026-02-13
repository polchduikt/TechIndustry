const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const db = require('../models');

class CourseService {
    async getAllCourses() {
        try {
            const courses = await db.Course.findAll({
                attributes: ['id', 'title', 'slug', 'description', 'category', 'price', 'thumbnail', 'level', 'created_at'],
                include: [{
                    model: db.Module,
                    as: 'modules',
                    attributes: ['id', 'title', 'order'],
                    include: [{
                        model: db.Lesson,
                        as: 'lessons',
                        attributes: ['id']
                    }]
                }],
                order: [
                    ['created_at', 'DESC'],
                    [{ model: db.Module, as: 'modules' }, 'order', 'ASC']
                ]
            });
            return courses;
        } catch (error) {
            throw error;
        }
    }

    async getCourseBySlug(slug) {
        const course = await db.Course.findOne({
            where: { slug },
            attributes: ['id', 'title', 'slug', 'description', 'category', 'price', 'thumbnail', 'level'],
            include: [{
                model: db.Module,
                as: 'modules',
                attributes: ['id', 'title', 'order', 'course_id'],
                include: [{
                    model: db.Lesson,
                    as: 'lessons',
                    attributes: ['id', 'title', 'type', 'order', 'duration_minutes']
                }],
                order: [['order', 'ASC']]
            }],
            order: [
                [{ model: db.Module, as: 'modules' }, 'order', 'ASC'],
                [{ model: db.Module, as: 'modules' }, { model: db.Lesson, as: 'lessons' }, 'order', 'ASC']
            ]
        });
        return course;
    }

    async getLessonContent(lessonId) {
        const lesson = await db.Lesson.findByPk(lessonId, {
            attributes: ['id', 'title', 'content_path', 'module_id']
        });

        if (!lesson) throw new Error('Lesson not found');

        const normalizedPath = lesson.content_path.replace(/\\/g, '/');

        const possiblePaths = [
            path.join(process.cwd(), normalizedPath),
            path.join(__dirname, '../../', normalizedPath),
            path.join('/home/site/wwwroot', normalizedPath)
        ];

        let rawMarkdown = null;
        let finalPath = null;

        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                finalPath = testPath;
                rawMarkdown = fs.readFileSync(finalPath, 'utf-8');
                break;
            }
        }

        if (!rawMarkdown) {
            console.error('Error: File not found. Tried paths:', possiblePaths);
            throw new Error(`File not found: ${normalizedPath}`);
        }

        const lessons = await db.Lesson.findAll({
            where: { module_id: lesson.module_id },
            attributes: ['id', 'order'],
            order: [['order', 'ASC']]
        });

        const index = lessons.findIndex(l => l.id === lesson.id);

        return {
            id: lesson.id,
            title: lesson.title,
            content: marked.parse(rawMarkdown),
            moduleId: lesson.module_id,
            next: index < lessons.length - 1 ? lessons[index + 1].id : null,
            prev: index > 0 ? lessons[index - 1].id : null
        };
    }
}

module.exports = new CourseService();