const db = require('../models');

class LeaderboardService {
    constructor() {
        this.topUsersCache = new Map();
        this.topUsersCacheMs = Number(process.env.LEADERBOARD_CACHE_MS || 60000);
        this.publicProfileCache = new Map();
        this.publicProfileCacheMs = Number(process.env.PUBLIC_PROFILE_CACHE_MS || 60000);
    }

    async getTopUsers(limit = 100) {
        const cacheKey = `top:${limit}`;
        const cached = this.topUsersCache.get(cacheKey);
        if (cached && (Date.now() - cached.cachedAt) < this.topUsersCacheMs) {
            return cached.data;
        }

        const topUsers = await db.UserLevel.findAll({
            limit,
            attributes: ['level', 'experience', 'coins', 'badges'],
            order: [
                ['level', 'DESC'],
                ['experience', 'DESC']
            ],
            include: [{
                model: db.User,
                as: 'user',
                attributes: ['id', 'username'],
                include: [{
                    model: db.Customer,
                    attributes: ['first_name', 'last_name', 'avatar_data', 'avatar_frame', 'title_badge', 'profile_theme']
                }]
            }]
        });

        const userIds = topUsers.map((entry) => entry.user?.id).filter(Boolean);
        const quizCounts = new Map();

        if (userIds.length > 0) {
            const rows = await db.sequelize.query(
                `
                SELECT
                    user_id,
                    COALESCE(SUM(json_array_length(completed_quizzes)), 0)::int AS quizzes_passed
                FROM user_progress
                WHERE user_id IN (:userIds)
                GROUP BY user_id
                `,
                {
                    replacements: { userIds },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            rows.forEach((row) => {
                quizCounts.set(Number(row.user_id), Number(row.quizzes_passed) || 0);
            });
        }

        const formattedUsers = topUsers.map((userLevel, index) => {
            const data = userLevel.get({ plain: true });
            const customer = data.user.Customer || {};
            const allBadges = data.badges || [];

            const recentBadges = allBadges
                .slice(-5)
                .reverse()
                .map((badgeId) => this.getBadgeDetails(badgeId))
                .filter(Boolean);

            const quizzesPassed = quizCounts.get(Number(data.user.id)) || 0;

            return {
                rank: index + 1,
                username: data.user.username,
                fullName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
                avatar: customer.avatar_data || null,
                avatarFrame: customer.avatar_frame || null,
                profileTheme: customer.profile_theme || 'default',
                level: data.level,
                experience: data.experience,
                badgeCount: allBadges.length,
                avatar_frame: customer.avatar_frame,
                title_badge: customer.title_badge,
                recentBadges,
                quizzesPassed
            };
        });

        this.topUsersCache.set(cacheKey, {
            cachedAt: Date.now(),
            data: formattedUsers
        });

        return formattedUsers;
    }

    async getPublicProfile(username) {
        const normalizedUsername = (username || '').toLowerCase();
        const cached = this.publicProfileCache.get(normalizedUsername);
        if (cached && (Date.now() - cached.cachedAt) < this.publicProfileCacheMs) {
            return cached.data;
        }

        const user = await db.User.findOne({
            where: { username },
            attributes: ['id', 'username', 'createdAt'],
            include: [
                {
                    model: db.Customer,
                    attributes: ['first_name', 'last_name', 'avatar_data', 'hide_courses', 'profile_theme', 'avatar_frame', 'title_badge']
                },
                {
                    model: db.UserLevel,
                    as: 'levelData',
                    attributes: ['level', 'experience', 'coins', 'badges']
                }
            ]
        });

        if (!user) throw new Error('User not found');

        const progressStats = await db.UserProgress.findAll({
            where: { user_id: user.id },
            attributes: ['id', 'status', 'completed_lessons', 'completed_quizzes', 'course_id'],
            include: [{
                model: db.Course,
                as: 'course',
                attributes: ['id', 'title', 'slug', 'thumbnail', 'category']
            }]
        });

        const progressPlain = progressStats.map((progress) => progress.get({ plain: true }));
        const courseIds = [...new Set(progressPlain.map((row) => row.course_id).filter(Boolean))];
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

        let quizzesPassed = 0;
        progressPlain.forEach((progress) => {
            if (Array.isArray(progress.completed_quizzes)) {
                quizzesPassed += progress.completed_quizzes.length;
            }
        });

        const progressFormatted = progressPlain.map((data) => {
            const totalLessons = lessonCountByCourse.get(Number(data.course_id)) || 0;
            const completedCount = Array.isArray(data.completed_lessons) ? data.completed_lessons.length : 0;
            const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            const isFinished = data.status === 'completed' || percent === 100;

            return {
                ...data,
                totalLessons,
                completedCount,
                percent,
                isFinished
            };
        });

        const completedCourses = progressPlain.filter((progress) => progress.status === 'completed').length;
        const inProgressCourses = progressPlain.filter((progress) => progress.status === 'in_progress').length;
        const userLevel = user.levelData || { level: 0, experience: 0, badges: [] };
        const allBadges = userLevel.badges || [];

        const badges = allBadges
            .map((badgeId) => this.getBadgeDetails(badgeId))
            .filter(Boolean);

        const shopService = require('./shopService');
        const publicInventory = await shopService.getUserPurchasesPublic(user.id);

        const LEVEL_THRESHOLDS = [
            0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
            4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
            26000, 30500, 35500, 41000, 47000, 53500, 60500, 68000, 76000, 84500, 93500,
            100000, 107000, 114500, 122500, 131000, 140000, 149500, 159500, 170000, 181000,
            192500, 204500, 217000, 230000, 243500, 257500, 272000, 287000, 302500, 318500,
            335500, 353500, 372500, 392500, 413500, 435500, 458500, 482500, 507500, 533500,
            560500, 588500, 617500, 647500, 678500, 710500, 743500, 777500, 812500, 848500,
            885500, 923500, 962500, 1002500, 1043500, 1085500, 1128500, 1172500, 1217500, 1263500,
            1310500, 1358500, 1407500, 1457500, 1508500, 1560500, 1613500, 1667500, 1722500, 1778500,
            1836500, 1895500, 1955500, 2016500, 2078500, 2141500, 2205500, 2270500, 2336500, 2403500
        ];

        const currentLevelXp = LEVEL_THRESHOLDS[userLevel.level] || 0;
        const nextLevelXp = userLevel.level < LEVEL_THRESHOLDS.length - 1
            ? LEVEL_THRESHOLDS[userLevel.level + 1]
            : null;
        let progressPercent = 0;
        if (nextLevelXp) {
            const xpInCurrentLevel = userLevel.experience - currentLevelXp;
            const xpNeededForLevel = nextLevelXp - currentLevelXp;
            progressPercent = Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
        } else {
            progressPercent = 100;
        }

        const profileData = {
            username: user.username,
            fullName: `${user.Customer.first_name} ${user.Customer.last_name}`,
            avatar: user.Customer.avatar_data,
            avatarFrame: user.Customer.avatar_frame,
            titleBadge: user.Customer.title_badge,
            joinedAt: user.createdAt,
            level: userLevel.level,
            experience: userLevel.experience,
            nextLevelXp,
            progressPercent,
            profileTheme: user.Customer.profile_theme || 'default',
            badges,
            badgeCount: badges.length,
            quizzesPassed,
            publicInventory,
            stats: {
                totalCourses: progressPlain.length,
                completedCourses,
                inProgressCourses
            },
            progress: progressFormatted,
            hideCourses: user.Customer.hide_courses || false
        };

        this.publicProfileCache.set(normalizedUsername, {
            cachedAt: Date.now(),
            data: profileData
        });

        return profileData;
    }

    getBadgeDetails(badgeId) {
        const BADGES = {
            'level_1': { id: 'level_1', name: 'Новачок', description: 'Досягнуто 1 рівень', icon: 'badge-level-1' },
            'level_5': { id: 'level_5', name: 'Учень', description: 'Досягнуто 5 рівень', icon: 'badge-level-5' },
            'level_10': { id: 'level_10', name: 'Майстер', description: 'Досягнуто 10 рівень', icon: 'badge-level-10' },
            'level_15': { id: 'level_15', name: 'Експерт', description: 'Досягнуто 15 рівень', icon: 'badge-level-15' },
            'level_20': { id: 'level_20', name: 'Легенда', description: 'Досягнуто 20 рівень', icon: 'badge-level-20' },
            'level_30': { id: 'level_30', name: 'Ветеран', description: 'Досягнуто 30 рівень', icon: 'badge-level-30' },
            'level_40': { id: 'level_40', name: 'Герой', description: 'Досягнуто 40 рівень', icon: 'badge-level-40' },
            'level_50': { id: 'level_50', name: 'Напівбог', description: 'Досягнуто 50 рівень', icon: 'badge-level-50' },
            'level_60': { id: 'level_60', name: 'Титан', description: 'Досягнуто 60 рівень', icon: 'badge-level-60' },
            'level_70': { id: 'level_70', name: 'Безсмертний', description: 'Досягнуто 70 рівень', icon: 'badge-level-70' },
            'level_80': { id: 'level_80', name: 'Владика', description: 'Досягнуто 80 рівень', icon: 'badge-level-80' },
            'level_90': { id: 'level_90', name: 'Творець', description: 'Досягнуто 90 рівень', icon: 'badge-level-90' },
            'level_100': { id: 'level_100', name: 'Абсолют', description: 'Досягнуто 100 рівень', icon: 'badge-level-100' },
            'first_course': { id: 'first_course', name: 'Перший крок', description: 'Завершено перший курс', icon: 'badge-first-course' },
            'course_3': { id: 'course_3', name: 'Старанний', description: 'Завершено 3 курси', icon: 'badge-course-3' },
            'course_5': { id: 'course_5', name: 'Відданий', description: 'Завершено 5 курсів', icon: 'badge-course-5' },
            'perfect_quiz': { id: 'perfect_quiz', name: 'Перфекціоніст', description: 'Здано тест на 100%', icon: 'badge-perfect' }
        };
        return BADGES[badgeId] || null;
    }
}

module.exports = new LeaderboardService();
