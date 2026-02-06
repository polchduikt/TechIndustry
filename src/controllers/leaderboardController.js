const leaderboardService = require('../services/leaderboardService');

exports.renderLeaderboard = async (req, res) => {
    try {
        const topUsers = await leaderboardService.getTopUsers(100);
        res.render('leaderboard', {
            title: 'Таблиця лідерів | TechIndustry',
            topUsers,
            user: res.locals.user
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).send('Помилка завантаження таблиці лідерів');
    }
};

exports.renderPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const profileData = await leaderboardService.getPublicProfile(username);
        const isOwnProfile = res.locals.user && res.locals.user.username === username;
        res.render('public-profile', {
            title: `${profileData.username} | TechIndustry`,
            profileData,
            isOwnProfile,
            user: res.locals.user
        });
    } catch (error) {
        console.error('Public profile error:', error);
        if (error.message === 'Користувача не знайдено') {
            return res.status(404).send('Користувача не знайдено');
        }
        res.status(500).send('Помилка завантаження профілю');
    }
};