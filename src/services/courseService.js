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
            where: {slug},
            include: [{model: db.Module, as: 'modules', include: [{model: db.Lesson, as: 'lessons'}]}]
        });
        return course;
    }

    async getLessonContent(lessonId) {
        const lesson = await db.Lesson.findByPk(lessonId);
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
            console.log(`Checking path: ${testPath}`);
            if (fs.existsSync(testPath)) {
                finalPath = testPath;
                rawMarkdown = fs.readFileSync(finalPath, 'utf-8');
                console.log(`Success: File found at ${finalPath}`);
                break;
            }
        }

        if (!rawMarkdown) {
            console.error('Error: File not found. Tried paths:', possiblePaths);
            throw new Error(`File not found: ${normalizedPath}`);
        }

        const lessons = await db.Lesson.findAll({
            where: {module_id: lesson.module_id},
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