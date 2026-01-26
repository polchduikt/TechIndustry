const db = require('../models');

class ProgressService {
    async startCourse(userId, courseSlug) {
        const course = await db.Course.findOne({
            where: { slug: courseSlug },
            include: [{
                model: db.Module,
                as: 'modules',
                include: [{
                    model: db.Lesson,
                    as: 'lessons'
                }]
            }]
        });

        if (!course) {
            throw new Error('Course not found');
        }

        let progress = await db.UserProgress.findOne({
            where: {
                user_id: userId,
                course_id: course.id
            }
        });

        if (progress) {
            await progress.update({
                last_accessed: new Date()
            });
            return progress;
        }

        progress = await db.UserProgress.create({
            user_id: userId,
            course_id: course.id,
            status: 'in_progress',
            score: 0,
            last_accessed: new Date()
        });

        return progress;
    }

    async getUserProgress(userId) {
        const progress = await db.UserProgress.findAll({
            where: { user_id: userId },
            include: [{
                model: db.Course,
                as: 'course',
                include: [{
                    model: db.Module,
                    as: 'modules',
                    include: [{
                        model: db.Lesson,
                        as: 'lessons'
                    }]
                }]
            }],
            order: [['last_accessed', 'DESC']]
        });

        return progress;
    }

    async getCourseProgress(userId, courseSlug) {
        const course = await db.Course.findOne({
            where: { slug: courseSlug }
        });

        if (!course) {
            throw new Error('Course not found');
        }

        const progress = await db.UserProgress.findOne({
            where: {
                user_id: userId,
                course_id: course.id
            },
            include: [{
                model: db.Course,
                as: 'course',
                include: [{
                    model: db.Module,
                    as: 'modules',
                    include: [{
                        model: db.Lesson,
                        as: 'lessons'
                    }]
                }]
            }]
        });

        if (!progress) {
            return {
                started: false,
                course: course
            };
        }

        return {
            started: true,
            progress: progress
        };
    }

    async updateLessonProgress(userId, lessonId, completed) {
        const lesson = await db.Lesson.findByPk(lessonId, {
            include: [{
                model: db.Module,
                as: 'module',
                include: [{
                    model: db.Course,
                    as: 'course'
                }]
            }]
        });

        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const courseId = lesson.module.course_id;

        let progress = await db.UserProgress.findOne({
            where: {
                user_id: userId,
                course_id: courseId
            }
        });

        if (!progress) {
            throw new Error('Start the course first');
        }

        await progress.update({
            last_accessed: new Date()
        });

        const allLessons = await db.Lesson.findAll({
            include: [{
                model: db.Module,
                as: 'module',
                where: { course_id: courseId }
            }]
        });

        return progress;
    }
}

module.exports = new ProgressService();
