const userService = require('../services/userService');
const progressService = require('../services/progressService');
const gamificationService = require('../services/gamificationService');
const db = require('../models');

exports.renderProfile = async (req, res) => {
    try {
        const progressRaw = await progressService.getUserProgress(req.userId);
        const progressFormatted = await Promise.all(progressRaw.map(async (p) => {
            const data = p.get({ plain: true });
            let totalLessons = 0;
            if (data.course && data.course.modules) {
                data.course.modules.forEach(m => {
                    totalLessons += (m.lessons?.length || 0);
                });
            }
            const completedCount = data.completed_lessons?.length || 0;
            const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            if (percent === 100 && data.status !== 'completed') {
                await db.UserProgress.update(
                    { status: 'completed' },
                    { where: { id: data.id } }
                );
                data.status = 'completed';
            }

            const isFinished = data.status === 'completed' || percent === 100;
            return {
                ...data,
                totalLessons,
                completedCount,
                percent,
                totalHours: totalLessons * 2,
                completedHours: completedCount * 2,
                isFinished
            };
        }));
        const gamificationStats = await gamificationService.getUserStats(req.userId);
        res.render('profile', {
            title: 'TechIndustry | Профіль',
            progress: progressFormatted,
            stats: {
                total: progressFormatted.length,
                completed: progressFormatted.filter(p => p.isFinished).length,
                streak: 1
            },
            gamification: gamificationStats,
            isOwnProfile: true,
            user: res.locals.user
        });
    } catch (e) {
        console.error("Profile SSR Error:", e);
        res.status(500).send('Помилка завантаження профілю');
    }
};

exports.renderGamificationInfo = (req, res) => {
    res.render('gamification-info', {
        title: 'TechIndustry | Система XP',
        user: res.locals.user
    });
};

exports.renderSettings = async (req, res) => {
    try {
        const user = await userService.getProfile(req.userId);
        res.render('settings', { title: 'Налаштування', userData: user });
    } catch (e) { res.status(500).send('Error'); }
};

exports.updateProfile = async (req, res) => {
    try {
        const result = await userService.updateProfile(req.userId, req.body);
        res.json({ message: 'Оновлено', requiresReauth: result.requiresReauth });
    } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.changePassword = async (req, res) => {
    try {
        await userService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
        res.clearCookie('token').json({ message: 'Пароль змінено' });
    } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.uploadAvatar = async (req, res) => {
    try {
        const avatarUrl = await userService.saveAvatar(req.userId, req.file);
        res.json({ avatarUrl });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteAvatar = async (req, res) => {
    try {
        await userService.deleteAvatar(req.userId);
        res.json({ message: 'Видалено' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};