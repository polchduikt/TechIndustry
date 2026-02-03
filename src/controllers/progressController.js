const progressService = require('../services/progressService');

exports.startCourse = async (req, res) => {
    try {
        const { courseSlug } = req.body;
        const progress = await progressService.startCourse(req.userId, courseSlug);
        res.json({ message: 'Курс розпочато', progress });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateLessonProgress = async (req, res) => {
    try {
        const { lessonId, completed } = req.body;
        const progress = await progressService.updateLessonProgress(req.userId, lessonId, completed);
        res.json({ message: 'Прогрес оновлено', progress });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUserProgress = async (req, res) => {
    try {
        const progress = await progressService.getUserProgress(req.userId);
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};