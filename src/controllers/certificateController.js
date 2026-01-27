const certificateService = require('../services/certificateService');
const { UserProgress, Course } = require('../models');
const db = require('../models');

class CertificateController {
    async downloadCertificate(req, res) {
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
                        as: 'course',
                        include: [
                            {
                                model: db.Module,
                                as: 'modules',
                                include: [
                                    {
                                        model: db.Lesson,
                                        as: 'lessons'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!progress) {
                return res.status(404).json({
                    message: 'Course progress not found'
                });
            }

            const isCompleted = await certificateService.verifyCourseCompletion(
                userId,
                courseId,
                progress
            );

            if (!isCompleted) {
                return res.status(400).json({
                    message: 'Course is not completed yet'
                });
            }

            const pdfDoc = await certificateService.createPDF(userId, courseId);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `inline; filename=certificate_${courseId}.pdf`
            );

            pdfDoc.pipe(res);
            pdfDoc.end();
        } catch (error) {
            res.status(500).json({
                message: 'Failed to generate certificate',
                error: error.message
            });
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
