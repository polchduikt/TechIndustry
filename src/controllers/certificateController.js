const certificateService = require('../services/certificateService');
const { UserProgress, Course } = require('../models');
const db = require('../models');

class CertificateController {

    async renderCertificate(req, res) {
        try {
            const userId = req.userId;
            const { course: courseId } = req.query;
            if (!courseId) return res.redirect('/profile');
            const progress = await UserProgress.findOne({
                where: { user_id: userId, course_id: courseId },
                include: [{
                    model: Course,
                    as: 'course',
                    include: [{ model: db.Module, as: 'modules', include: ['lessons'] }]
                }]
            });

            if (!progress || progress.status !== 'completed') {
                return res.redirect('/profile');
            }

            let totalLessons = 0;
            progress.course.modules.forEach(m => {
                totalLessons += m.lessons?.length || 0;
            });

            const formattedDate = new Date(progress.updatedAt).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            res.render('certificate', {
                title: `Сертифікат | ${progress.course.title}`,
                course: progress.course.get({ plain: true }),
                courseId: courseId,
                completionDate: formattedDate,
                duration: totalLessons * 2
            });
        } catch (error) {
            console.error("Certificate SSR Error:", error);
            res.status(500).send('Помилка завантаження сторінки');
        }
    }

    async downloadCertificate(req, res) {
        try {
            const userId = req.userId || (req.user ? req.user.id : null);
            const { courseId } = req.params;
            if (!userId) {
                return res.status(401).json({ message: 'Користувач не авторизований' });
            }
            const buffer = await certificateService.generateCertificate(userId, courseId);

            res.contentType("application/pdf");
            res.setHeader('Content-Disposition', `inline; filename=certificate-${courseId}.pdf`);
            res.send(buffer);
        } catch (error) {
            console.error("PDF Download Error:", error);
            res.status(500).json({ message: error.message });
        }
    }

    async checkAvailability(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'User is not authenticated'
                });
            }
            const userId = req.user.id;
            const { courseId } = req.params;
            const progress = await UserProgress.findOne({
                where: {
                    user_id: userId,
                    course_id: courseId
                },
                include: [
                    {
                        model: Course,
                        as: 'course'
                    }
                ]
            });

            if (!progress) {
                return res.json({
                    available: false,
                    reason: 'Course has not been started'
                });
            }
            const isCompleted = await certificateService.verifyCourseCompletion(
                userId,
                courseId,
                progress
            );
            const totalLessons = certificateService.calculateTotalLessons(
                progress.course
            );
            const completedLessons =
                progress.completed_lessons?.length || 0;

            res.json({
                available: isCompleted,
                status: progress.status,
                completedLessons,
                totalLessons,
                progressPercent:
                    totalLessons > 0
                        ? Math.round(
                            (completedLessons / totalLessons) * 100
                        )
                        : 0
            });
        } catch (error) {
            res.status(500).json({
                message: 'Failed to check certificate availability'
            });
        }
    }

    async generate(req, res) {
        return this.downloadCertificate(req, res);
    }
}

module.exports = new CertificateController();
