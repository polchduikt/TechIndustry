const progressService = require('../services/progressService');

exports.startCourse = async (req, res) => {
    try {
        const { courseSlug } = req.body;
        const userId = req.userId; // Береться з middleware авторизації

        const progress = await progressService.startCourse(userId, courseSlug);
        res.json({
            message: 'Курс успішно розпочато',
            progress
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.userId;
        const progress = await progressService.getUserProgress(userId);
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateLessonProgress = async (req, res) => {
    try {
        const { lessonId, completed } = req.body;
        const userId = req.userId;

        const progress = await progressService.updateLessonProgress(userId, lessonId, completed);
        res.json({
            message: 'Прогрес оновлено',
            progress
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getCourseProgress = async (req, res) => {
    try {
        const { courseSlug } = req.params;
        const userId = req.userId;

        const progress = await progressService.getCourseProgress(userId, courseSlug);
        res.json(progress);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};