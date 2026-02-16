const db = require('../models');
const gamificationService = require('./gamificationService');

class ProgressService {
    async getUserProgressByCourse(userId, courseId) {
        return await db.UserProgress.findOne({
            where: { user_id: userId, course_id: courseId },
            attributes: ['id', 'user_id', 'course_id', 'status', 'score', 'completed_lessons', 'completed_quizzes', 'last_accessed']
        });
    }

    async getUserProgress(userId) {
        return await db.UserProgress.findAll({
            where: { user_id: userId },
            attributes: ['id', 'user_id', 'course_id', 'status', 'score', 'completed_lessons', 'completed_quizzes', 'last_accessed', 'started_at', 'completed_at'],
            include: [{
                model: db.Course,
                as: 'course',
                attributes: ['id', 'title', 'slug', 'thumbnail', 'category'],
                include: [{
                    model: db.Module,
                    as: 'modules',
                    attributes: ['id', 'order'],
                    include: [{
                        model: db.Lesson,
                        as: 'lessons',
                        attributes: ['id']
                    }]
                }]
            }],
            order: [
                ['last_accessed', 'DESC'],
                [{ model: db.Course, as: 'course' }, { model: db.Module, as: 'modules' }, 'order', 'ASC']
            ]
        });
    }

    async getUserProgressForOverview(userId) {
        const progressRows = await db.UserProgress.findAll({
            where: { user_id: userId },
            attributes: ['id', 'user_id', 'course_id', 'status', 'completed_lessons', 'completed_quizzes', 'last_accessed'],
            include: [{
                model: db.Course,
                as: 'course',
                attributes: ['id', 'title', 'slug', 'thumbnail', 'category']
            }],
            order: [['last_accessed', 'DESC']]
        });

        const plainRows = progressRows.map((row) => row.get({ plain: true }));
        const courseIds = [...new Set(plainRows.map((row) => row.course_id).filter(Boolean))];

        const lessonCountByCourse = new Map();
        if (courseIds.length > 0) {
            const lessonRows = await db.sequelize.query(
                `
                SELECT
                    m.course_id,
                    COUNT(l.id)::int AS total_lessons
                FROM modules m
                LEFT JOIN lessons l ON l.module_id = m.id
                WHERE m.course_id IN (:courseIds)
                GROUP BY m.course_id
                `,
                {
                    replacements: { courseIds },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            lessonRows.forEach((row) => {
                lessonCountByCourse.set(Number(row.course_id), Number(row.total_lessons) || 0);
            });
        }

        return plainRows.map((row) => {
            const totalLessons = lessonCountByCourse.get(Number(row.course_id)) || 0;
            const completedCount = Array.isArray(row.completed_lessons) ? row.completed_lessons.length : 0;
            const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            const isFinished = row.status === 'completed' || percent === 100;

            return {
                ...row,
                totalLessons,
                completedCount,
                percent,
                totalHours: totalLessons * 2,
                completedHours: completedCount * 2,
                isFinished
            };
        });
    }

    async startCourse(userId, courseSlug) {
        const course = await db.Course.findOne({
            where: { slug: courseSlug },
            attributes: ['id', 'title']
        });

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
            attributes: ['id', 'module_id'],
            include: [{
                model: db.Module,
                as: 'module',
                attributes: ['id', 'course_id'],
                include: [{
                    model: db.Course,
                    as: 'course',
                    attributes: ['id', 'slug'],
                    include: [{
                        model: db.Module,
                        as: 'modules',
                        attributes: ['id'],
                        include: [{
                            model: db.Lesson,
                            as: 'lessons',
                            attributes: ['id']
                        }]
                    }]
                }]
            }]
        });

        if (!lesson) throw new Error('Урок не знайдено');

        const course = lesson.module.course;

        let progress = await db.UserProgress.findOne({
            where: { user_id: userId, course_id: course.id },
            attributes: ['id', 'user_id', 'course_id', 'status', 'completed_lessons']
        });

        if (!progress) {
            progress = await this.startCourse(userId, course.slug);
        }

        let completedLessons = [...(progress.completed_lessons || [])];
        const wasCompleted = completedLessons.includes(lessonId);
        let gamificationResult = null;

        if (completed && !wasCompleted) {
            completedLessons.push(lessonId);
            gamificationResult = await gamificationService.onLessonComplete(userId, lessonId);
        } else if (!completed) {
            completedLessons = completedLessons.filter(id => id !== lessonId);
        }

        let totalLessonsInCourse = 0;
        course.modules.forEach(m => {
            totalLessonsInCourse += (m.lessons?.length || 0);
        });

        const wasCompletedBefore = progress.status === 'completed';
        let newStatus = 'in_progress';
        let courseCompletionResult = null;

        if (totalLessonsInCourse > 0 && completedLessons.length >= totalLessonsInCourse) {
            newStatus = 'completed';
            if (!wasCompletedBefore) {
                courseCompletionResult = await gamificationService.onCourseComplete(userId, course.id);
            }
        }

        await progress.update({
            completed_lessons: completedLessons,
            status: newStatus,
            last_accessed: new Date()
        });

        return {
            progress,
            gamificationResult,
            courseCompletionResult,
            isFirstCompletion: completed && !wasCompleted
        };
    }
}

module.exports = new ProgressService();
