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
        const user = await userService.getProfile(req.userId);

        res.render('profile', {
            title: 'Профіль | TechIndustry',
            progress: progressFormatted,
            stats: {
                total: progressFormatted.length,
                completed: progressFormatted.filter(p => p.isFinished).length,
                streak: 1
            },
            gamification: gamificationStats,
            isOwnProfile: true,
            user: res.locals.user,
            hideCourses: user.Customer.hide_courses || false,
            csrfToken: req.csrfToken ? req.csrfToken() : ''
        });
    } catch (e) {
        console.error("Profile SSR Error:", e);
        res.status(500).send('Помилка завантаження профілю');
    }
};

exports.renderGamificationInfo = (req, res) => {
    res.render('gamification-info', {
        title: 'Система XP | TechIndustry',
        user: res.locals.user,
        csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
};

exports.renderSettings = async (req, res) => {
    try {
        const user = await userService.getProfile(req.userId);
        let flashMessage = null;
        if (req.session.flashMessage && req.session.flashUserId === req.userId) {
            flashMessage = req.session.flashMessage;
        }
        delete req.session.flashMessage;
        delete req.session.flashUserId;

        res.render('settings', {
            title: 'Налаштування | TechIndustry',
            user: user,
            flashMessage: flashMessage,
            csrfToken: req.csrfToken ? req.csrfToken() : ''
        });
    } catch (e) {
        console.error('renderSettings error:', e);
        res.status(500).send('Error');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const allowedUpdates = {
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            patronymic: req.body.patronymic,
            birth_date: req.body.birth_date,
            about: req.body.about,
            github_link: req.body.github_link
        };

        const result = await userService.updateProfile(req.userId, allowedUpdates);

        if (result.requiresReauth) {
            res.clearCookie('token');
            return res.redirect('/login');
        }
        req.session.flashMessage = { type: 'success', text: 'Профіль оновлено!' };
        req.session.flashUserId = req.userId;
        res.redirect('/settings');
    } catch (e) {
        req.session.flashMessage = { type: 'error', text: e.message };
        req.session.flashUserId = req.userId;
        res.redirect('/settings');
    }
};

exports.changePassword = async (req, res) => {
    try {
        await userService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
        res.clearCookie('token');
        res.redirect('/login');
    } catch (e) {
        req.session.flashMessage = { type: 'error', text: e.message };
        req.session.flashUserId = req.userId;
        res.redirect('/settings');
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        await userService.saveAvatar(req.userId, req.file);
        req.session.flashMessage = { type: 'success', text: 'Аватар завантажено!' };
        req.session.flashUserId = req.userId;
        res.redirect('/settings');
    } catch (e) {
        req.session.flashMessage = { type: 'error', text: e.message };
        req.session.flashUserId = req.userId;
        res.redirect('/settings');
    }
};

exports.deleteAvatar = async (req, res) => {
    try {
        await userService.deleteAvatar(req.userId);
        req.session.flashMessage = { type: 'success', text: 'Аватар видалено!' };
        req.session.flashUserId = req.userId;
        res.redirect('/settings');
    } catch (e) {
        req.session.flashMessage = { type: 'error', text: e.message };
        req.session.flashUserId = req.userId;
        res.redirect('/settings');
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        await userService.updatePreferences(req.userId, {
            hide_courses: req.body.hide_courses || false
        });
        res.json({ success: true, message: 'Налаштування оновлено!' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};