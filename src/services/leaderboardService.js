const db = require('../models');
const gamificationService = require('./gamificationService');

class LeaderboardService {
    async getTopUsers(limit = 100) {
        const topUsers = await db.UserLevel.findAll({
            limit,
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
                    attributes: ['first_name', 'last_name', 'avatar_data']
                }]
            }]
        });

        const formattedUsers = topUsers.map((userLevel, index) => {
            const data = userLevel.get({ plain: true });
            const allBadges = data.badges || [];
            const recentBadges = allBadges.slice(-5).reverse().map(badgeId => {
                const badge = this.getBadgeDetails(badgeId);
                return badge;
            }).filter(Boolean);

            return {
                rank: index + 1,
                username: data.user.username,
                fullName: `${data.user.Customer.first_name} ${data.user.Customer.last_name}`,
                avatar: data.user.Customer.avatar_data,
                level: data.level,
                experience: data.experience,
                badgeCount: allBadges.length,
                recentBadges
            };
        });
        return formattedUsers;
    }

    async getPublicProfile(username) {
        const user = await db.User.findOne({
            where: { username },
            attributes: ['id', 'username', 'createdAt'],
            include: [{
                model: db.Customer,
                attributes: ['first_name', 'last_name', 'avatar_data', 'hide_courses']
            }, {
                model: db.UserLevel,
                as: 'levelData'
            }]
        });

        if (!user) throw new Error('Користувача не знайдено');
        const progressStats = await db.UserProgress.findAll({
            where: { user_id: user.id },
            include: [{
                model: db.Course,
                as: 'course',
                include: [{
                    model: db.Module,
                    as: 'modules',
                    include: [{
                        model: db.Lesson,
                        as: 'lessons',
                        attributes: ['id']
                    }]
                }]
            }]
        });

        const progressFormatted = progressStats.map(p => {
            const data = p.get({ plain: true });
            let totalLessons = 0;
            if (data.course && data.course.modules) {
                data.course.modules.forEach(m => {
                    totalLessons += (m.lessons?.length || 0);
                });
            }
            const completedCount = data.completed_lessons?.length || 0;
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

        const completedCourses = progressStats.filter(p => p.status === 'completed').length;
        const inProgressCourses = progressStats.filter(p => p.status === 'in_progress').length;
        const userLevel = user.levelData || { level: 0, experience: 0, badges: [] };
        const allBadges = userLevel.badges || [];

        const badges = allBadges.map(badgeId => {
            return this.getBadgeDetails(badgeId);
        }).filter(Boolean);

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

        return {
            username: user.username,
            fullName: `${user.Customer.first_name} ${user.Customer.last_name}`,
            avatar: user.Customer.avatar_data,
            joinedAt: user.createdAt,
            level: userLevel.level,
            experience: userLevel.experience,
            nextLevelXp,
            progressPercent,
            badges,
            badgeCount: badges.length,
            stats: {
                totalCourses: progressStats.length,
                completedCourses,
                inProgressCourses
            },
            progress: progressFormatted,
            hideCourses: user.Customer.hide_courses || false
        };
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