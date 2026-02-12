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
        const result = await progressService.updateLessonProgress(req.userId, lessonId, completed);
        const response = {
            message: 'Прогрес оновлено',
            progress: result.progress
        };
        if (result.isFirstCompletion && result.gamificationResult) {
            response.rewards = {
                xpGained: result.gamificationResult.xpGained,
                coinsGained: result.gamificationResult.coinsGained,
                newCoinsBalance: result.gamificationResult.newCoinsBalance,
                leveledUp: result.gamificationResult.leveledUp,
                newLevel: result.gamificationResult.newLevel,
                newBadges: result.gamificationResult.newBadges
            };
        }
        if (result.courseCompletionResult) {
            response.courseCompletion = {
                xpGained: result.courseCompletionResult.xpGained,
                coinsGained: result.courseCompletionResult.coinsGained,
                newCoinsBalance: result.courseCompletionResult.newCoinsBalance,
                leveledUp: result.courseCompletionResult.leveledUp,
                newLevel: result.courseCompletionResult.newLevel,
                newBadges: result.courseCompletionResult.newBadges
            };
        }
        res.json(response);
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