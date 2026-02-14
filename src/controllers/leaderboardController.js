const leaderboardService = require('../services/leaderboardService');

exports.renderLeaderboard = async (req, res) => {
    try {
        const rawUsers = await leaderboardService.getTopUsers(100);
        const topUsers = rawUsers.map(user => ({
            rank: user.rank,
            username: user.username,
            avatar: user.avatar,
            level: user.level,
            avatarFrame: user.avatarFrame,
            profileTheme: user.profileTheme,
            points: user.points,
            experience: user.experience,
            badgeCount: user.badgeCount,
            recentBadges: user.recentBadges,
            quizzesPassed: user.quizzesPassed
        }));
        res.render('leaderboard', {
            title: 'Таблиця лідерів | TechIndustry',
            metaDescription: 'Рейтинг найкращих учнів TechIndustry. Переглядайте топ користувачів за рівнем, досвідом та досягненнями.',
            ogTitle: 'Таблиця лідерів — ТОП учнів TechIndustry',
            ogDescription: 'Змагайтесь з іншими учнями та досягайте вершин рейтингу на TechIndustry.',
            extraCss: ['/css/leaderboard.css', '/css/avatar-frames-styles.css'],
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
            title: `${profileData.fullName || profileData.username} | TechIndustry`,
            metaDescription: `Профіль ${profileData.fullName || profileData.username} на TechIndustry. Рівень: ${profileData.level}, курсів пройдено: ${profileData.stats.completedCourses}.`,
            ogTitle: `Профіль ${profileData.fullName || profileData.username}`,
            ogDescription: `Переглядайте досягнення та прогрес навчання ${profileData.fullName || profileData.username} на TechIndustry.`,
            ogImage: profileData.avatar || 'https://techindustry.app/assets/img/og-profile.png',
            extraCss: ['/css/profile.css', '/css/public-profile.css', '/css/avatar-frames-styles.css', '/css/inventory-styles.css'],
            noindex: false,
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