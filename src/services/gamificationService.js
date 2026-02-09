const db = require('../models');
const XP_CONFIG = {
    LESSON_COMPLETE: 50,
    QUIZ_PASS: 100,
    QUIZ_PERFECT: 150,
    COURSE_COMPLETE: 500,
    FIRST_COURSE: 200,
};

const LEVEL_THRESHOLDS = [
    0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, // 0-9
    4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000, // 10-19
    26000, // Level 20

    // 21 - 30
    30500, 35500, 41000, 47000, 53500, 60500, 68000, 76000, 84500, 93500,

    // 31 - 40
    100000, 107000, 114500, 122500, 131000, 140000, 149500, 159500, 170000, 181000,

    // 41 - 50
    192500, 204500, 217000, 230000, 243500, 257500, 272000, 287000, 302500, 318500,

    // 51 - 60
    335500, 353500, 372500, 392500, 413500, 435500, 458500, 482500, 507500, 533500,

    // 61 - 70
    560500, 588500, 617500, 647500, 678500, 710500, 743500, 777500, 812500, 848500,

    // 71 - 80
    885500, 923500, 962500, 1002500, 1043500, 1085500, 1128500, 1172500, 1217500, 1263500,

    // 81 - 90
    1310500, 1358500, 1407500, 1457500, 1508500, 1560500, 1613500, 1667500, 1722500, 1778500,

    // 91 - 100
    1836500, 1895500, 1955500, 2016500, 2078500, 2141500, 2205500, 2270500, 2336500, 2403500
];

const BADGES = {
    LEVEL_1: { id: 'level_1', name: 'Новачок', description: 'Досягнуто 1 рівень', icon: 'badge-level-1' },
    LEVEL_5: { id: 'level_5', name: 'Учень', description: 'Досягнуто 5 рівень', icon: 'badge-level-5' },
    LEVEL_10: { id: 'level_10', name: 'Майстер', description: 'Досягнуто 10 рівень', icon: 'badge-level-10' },
    LEVEL_15: { id: 'level_15', name: 'Експерт', description: 'Досягнуто 15 рівень', icon: 'badge-level-15' },
    LEVEL_20: { id: 'level_20', name: 'Легенда', description: 'Досягнуто 20 рівень', icon: 'badge-level-20' },
    LEVEL_30: { id: 'level_30', name: 'Ветеран', description: 'Досягнуто 30 рівень', icon: 'badge-level-30' },
    LEVEL_40: { id: 'level_40', name: 'Герой', description: 'Досягнуто 40 рівень', icon: 'badge-level-40' },
    LEVEL_50: { id: 'level_50', name: 'Напівбог', description: 'Досягнуто 50 рівень', icon: 'badge-level-50' },
    LEVEL_60: { id: 'level_60', name: 'Титан', description: 'Досягнуто 60 рівень', icon: 'badge-level-60' },
    LEVEL_70: { id: 'level_70', name: 'Безсмертний', description: 'Досягнуто 70 рівень', icon: 'badge-level-70' },
    LEVEL_80: { id: 'level_80', name: 'Владика', description: 'Досягнуто 80 рівень', icon: 'badge-level-80' },
    LEVEL_90: { id: 'level_90', name: 'Творець', description: 'Досягнуто 90 рівень', icon: 'badge-level-90' },
    LEVEL_100: { id: 'level_100', name: 'Абсолют', description: 'Досягнуто 100 рівень', icon: 'badge-level-100' },
    LEVEL_200: { id: 'level_200', name: 'Магістр', description: 'Досягнуто 200 рівень', icon: 'badge-level-200' },
    LEVEL_300: { id: 'level_300', name: 'Верховний', description: 'Досягнуто 300 рівень', icon: 'badge-level-300' },
    LEVEL_400: { id: 'level_400', name: 'Пророк', description: 'Досягнуто 400 рівень', icon: 'badge-level-400' },
    LEVEL_500: { id: 'level_500', name: 'Напівбог', description: 'Досягнуто 500 рівень', icon: 'badge-level-500' },
    LEVEL_600: { id: 'level_600', name: 'Безсмертний', description: 'Досягнуто 600 рівень', icon: 'badge-level-600' },
    LEVEL_700: { id: 'level_700', name: 'Обраний', description: 'Досягнуто 700 рівень', icon: 'badge-level-700' },
    LEVEL_800: { id: 'level_800', name: 'Вартовий Часу', description: 'Досягнуто 800 рівень', icon: 'badge-level-800' },
    LEVEL_900: { id: 'level_900', name: 'Владика Світів', description: 'Досягнуто 900 рівень', icon: 'badge-level-900' },
    LEVEL_1000: { id: 'level_1000', name: 'Абсолютний Розум', description: 'Досягнуто 1000 рівень', icon: 'badge-level-1000' },

    FIRST_COURSE: { id: 'first_course', name: 'Перший крок', description: 'Завершено перший курс', icon: 'badge-first-course' },
    COURSE_3: { id: 'course_3', name: 'Старанний', description: 'Завершено 3 курси', icon: 'badge-course-3' },
    COURSE_5: { id: 'course_5', name: 'Відданий', description: 'Завершено 5 курсів', icon: 'badge-course-5' },
    PERFECT_QUIZ: { id: 'perfect_quiz', name: 'Перфекціоніст', description: 'Здано тест на 100%', icon: 'badge-perfect' },
};

class GamificationService {
    async getUserLevel(userId) {
        let [userLevel] = await db.UserLevel.findOrCreate({
            where: { user_id: userId },
            defaults: {
                level: 0,
                experience: 0,
                badges: []
            }
        });
        return userLevel;
    }

    calculateLevel(experience) {
        let level = 0;
        for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (experience >= LEVEL_THRESHOLDS[i]) {
                level = i;
            } else {
                break;
            }
        }
        return level;
    }

    getXpForNextLevel(currentLevel) {
        if (currentLevel >= LEVEL_THRESHOLDS.length - 1) {
            return null;
        }
        return LEVEL_THRESHOLDS[currentLevel + 1];
    }

    async addExperience(userId, xpAmount, reason = '') {
        const userLevel = await this.getUserLevel(userId);
        const oldLevel = userLevel.level;
        const newExperience = userLevel.experience + xpAmount;
        const newLevel = this.calculateLevel(newExperience);

        await userLevel.update({
            experience: newExperience,
            level: newLevel
        });
        const levelUpBadges = [];
        if (newLevel > oldLevel) {
            for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
                const badgeKey = `LEVEL_${lvl}`;
                if (BADGES[badgeKey]) {
                    await this.awardBadge(userId, BADGES[badgeKey].id);
                    levelUpBadges.push(BADGES[badgeKey]);
                }
            }
        }
        return {
            oldLevel,
            newLevel,
            leveledUp: newLevel > oldLevel,
            experience: newExperience,
            xpGained: xpAmount,
            newBadges: levelUpBadges
        };
    }

    async awardBadge(userId, badgeId) {
        const userLevel = await this.getUserLevel(userId);
        const badges = userLevel.badges || [];
        if (!badges.includes(badgeId)) {
            badges.push(badgeId);
            await userLevel.update({ badges });
            return true;
        }
        return false;
    }

    async getUserBadges(userId) {
        const userLevel = await this.getUserLevel(userId);
        const badgeIds = userLevel.badges || [];
        return badgeIds.map(id => {
            const badge = Object.values(BADGES).find(b => b.id === id);
            return badge || null;
        }).filter(Boolean);
    }

    async onLessonComplete(userId) {
        return await this.addExperience(userId, XP_CONFIG.LESSON_COMPLETE, 'lesson_complete');
    }

    async onQuizComplete(userId, percent) {
        let xp = XP_CONFIG.QUIZ_PASS;
        const badges = [];
        if (percent === 100) {
            xp = XP_CONFIG.QUIZ_PERFECT;
            const awarded = await this.awardBadge(userId, BADGES.PERFECT_QUIZ.id);
            if (awarded) {
                badges.push(BADGES.PERFECT_QUIZ);
            }
        }
        const result = await this.addExperience(userId, xp, 'quiz_complete');
        result.newBadges = [...result.newBadges, ...badges];
        return result;
    }

    async onCourseComplete(userId) {
        const completedCourses = await db.UserProgress.count({
            where: {
                user_id: userId,
                status: 'completed'
            }
        });

        let xp = XP_CONFIG.COURSE_COMPLETE;
        const badges = [];
        if (completedCourses === 1) {
            xp += XP_CONFIG.FIRST_COURSE;
            const awarded = await this.awardBadge(userId, BADGES.FIRST_COURSE.id);
            if (awarded) {
                badges.push(BADGES.FIRST_COURSE);
            }
        }
        if (completedCourses === 3) {
            const awarded = await this.awardBadge(userId, BADGES.COURSE_3.id);
            if (awarded) badges.push(BADGES.COURSE_3);
        }
        if (completedCourses === 5) {
            const awarded = await this.awardBadge(userId, BADGES.COURSE_5.id);
            if (awarded) badges.push(BADGES.COURSE_5);
        }
        const result = await this.addExperience(userId, xp, 'course_complete');
        result.newBadges = [...result.newBadges, ...badges];
        return result;
    }

    async syncLevelBadges(userId) {
        const userLevel = await this.getUserLevel(userId);
        const currentLevel = userLevel.level;
        let badges = [...(userLevel.badges || [])];
        let hasChanges = false;
        for (let lvl = 1; lvl <= currentLevel; lvl++) {
            const badgeKey = `LEVEL_${lvl}`;
            if (BADGES[badgeKey]) {
                const badgeId = BADGES[badgeKey].id;
                if (!badges.includes(badgeId)) {
                    badges.push(badgeId);
                    hasChanges = true;
                }
            }
        }
        if (hasChanges) {
            await userLevel.update({ badges });
        }
        return hasChanges;
    }

    async syncCourseBadges(userId) {
        const completedCourses = await db.UserProgress.count({
            where: {
                user_id: userId,
                status: 'completed'
            }
        });

        const userLevel = await this.getUserLevel(userId);
        let badges = [...(userLevel.badges || [])];
        let hasChanges = false;
        if (completedCourses >= 1 && !badges.includes(BADGES.FIRST_COURSE.id)) {
            badges.push(BADGES.FIRST_COURSE.id);
            hasChanges = true;
        }
        if (completedCourses >= 3 && !badges.includes(BADGES.COURSE_3.id)) {
            badges.push(BADGES.COURSE_3.id);
            hasChanges = true;
        }
        if (completedCourses >= 5 && !badges.includes(BADGES.COURSE_5.id)) {
            badges.push(BADGES.COURSE_5.id);
            hasChanges = true;
        }
        if (hasChanges) {
            await userLevel.update({ badges });
        }
        return hasChanges;
    }

    async getUserStats(userId) {
        const userLevel = await this.getUserLevel(userId);
        await this.syncLevelBadges(userId);
        await this.syncCourseBadges(userId);
        const currentLevelXp = LEVEL_THRESHOLDS[userLevel.level];
        const nextLevelXp = this.getXpForNextLevel(userLevel.level);
        let progressPercent = 0;
        if (nextLevelXp) {
            const xpInCurrentLevel = userLevel.experience - currentLevelXp;
            const xpNeededForLevel = nextLevelXp - currentLevelXp;
            progressPercent = Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
        } else {
            progressPercent = 100;
        }
        const badges = await this.getUserBadges(userId);
        return {
            level: userLevel.level,
            experience: userLevel.experience,
            nextLevelXp,
            progressPercent,
            badges,
            badgeCount: badges.length
        };
    }
}

module.exports = new GamificationService();