const db = require('../models');
const gamificationService = require('./gamificationService');

class ProgressService {
    async getUserProgressByCourse(userId, courseId) {
        return await db.UserProgress.findOne({
            where: { user_id: userId, course_id: courseId }
        });
    }

    async getUserProgress(userId) {
        return await db.UserProgress.findAll({
            where: { user_id: userId },
            include: [{
                model: db.Course,
                as: 'course',
                include: [{
                    model: db.Module,
                    as: 'modules',
                    include: [{
                        model: db.Lesson,
                        as: 'lessons',
                        attributes: ['id']
                    }]
                }]
            }]
        });
    }

    async startCourse(userId, courseSlug) {
        const course = await db.Course.findOne({ where: { slug: courseSlug } });
        if (!course) throw new Error('Курс не знайдено');
        const [progress, created] = await db.UserProgress.findOrCreate({
            where: { user_id: userId, course_id: course.id },
            defaults: {
                status: 'in_progress',
                completed_lessons: [],
                completed_quizzes: [],
                started_at: new Date(),
                last_accessed: new Date()
            }
        });

        if (!created) {
            await progress.update({ last_accessed: new Date() });
        }
        return progress;
    }

    async updateLessonProgress(userId, lessonId, completed) {
        const lesson = await db.Lesson.findByPk(lessonId, {
            include: [{
                model: db.Module,
                as: 'module',
                include: [{
                    model: db.Course,
                    as: 'course',
                    include: [{
                        model: db.Module,
                        as: 'modules',
                        include: [{ model: db.Lesson, as: 'lessons' }]
                    }]
                }]
            }]
        });

        if (!lesson) throw new Error('Урок не знайдено');
        const course = lesson.module.course;
        let progress = await db.UserProgress.findOne({
            where: { user_id: userId, course_id: course.id }
        });

        if (!progress) {
            progress = await this.startCourse(userId, course.slug);
        }
        let completedLessons = [...(progress.completed_lessons || [])];
        const wasCompleted = completedLessons.includes(lessonId);

        if (completed && !wasCompleted) {
            completedLessons.push(lessonId);
            await gamificationService.onLessonComplete(userId);
        } else if (!completed) {
            completedLessons = completedLessons.filter(id => id !== lessonId);
        }

        let totalLessonsInCourse = 0;
        course.modules.forEach(m => {
            totalLessonsInCourse += (m.lessons?.length || 0);
        });
        const wasCompletedBefore = progress.status === 'completed';
        let newStatus = 'in_progress';
        if (totalLessonsInCourse > 0 && completedLessons.length >= totalLessonsInCourse) {
            newStatus = 'completed';
            if (!wasCompletedBefore) {
                await gamificationService.onCourseComplete(userId);
            }
        }
        await progress.update({
            completed_lessons: completedLessons,
            status: newStatus,
            last_accessed: new Date()
        });
        return progress;
    }
}

module.exports = new ProgressService();