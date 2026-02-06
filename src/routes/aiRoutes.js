const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

const LIMIT = 10;
const COOLDOWN_MS = 5 * 60 * 1000;

const SPAM_CONFIG = {
    MIN_MESSAGE_INTERVAL: 2000,
    MAX_DUPLICATE_COUNT: 2,
    MIN_MESSAGE_LENGTH: 2,
    MAX_MESSAGE_LENGTH: 1000,
    BURST_LIMIT: 5,
    BURST_WINDOW: 30000
};

router.get('/status', (req, res) => {
    const session = req.session;
    const now = Date.now();
    if (session.mentorResetTime && now >= session.mentorResetTime) {
        session.mentorCount = 0;
        session.mentorResetTime = null;
    }
    res.json({
        count: session.mentorCount || 0,
        limit: LIMIT,
        resetTime: session.mentorResetTime || null
    });
});

router.post('/chat', async (req, res) => {
    try {
        const session = req.session;
        const now = Date.now();
        if (!session.mentorAntiSpam) {
            session.mentorAntiSpam = {
                lastMessageTime: 0,
                lastMessage: '',
                duplicateCount: 0,
                burstMessages: [],
                violations: 0
            };
        }

        const antiSpam = session.mentorAntiSpam;
        const { message, history } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: "Некоректне повідомлення" });
        }

        const trimmedMessage = message.trim();

        if (trimmedMessage.length < SPAM_CONFIG.MIN_MESSAGE_LENGTH) {
            return res.status(400).json({ error: "Повідомлення занадто коротке" });
        }

        if (trimmedMessage.length > SPAM_CONFIG.MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ error: "Повідомлення занадто довге (макс. 1000 символів)" });
        }

        const timeSinceLastMessage = now - antiSpam.lastMessageTime;
        if (timeSinceLastMessage < SPAM_CONFIG.MIN_MESSAGE_INTERVAL) {
            antiSpam.violations++;
            if (antiSpam.violations >= 3) {
                session.mentorResetTime = now + COOLDOWN_MS;
                session.mentorCount = LIMIT;
                return res.status(429).json({
                    error: "Забагато швидких запитів. Заблоковано на 5 хвилин.",
                    resetTime: session.mentorResetTime
                });
            }

            return res.status(429).json({
                error: `Зачекайте ${Math.ceil((SPAM_CONFIG.MIN_MESSAGE_INTERVAL - timeSinceLastMessage) / 1000)} сек.`
            });
        }
        if (trimmedMessage.toLowerCase() === antiSpam.lastMessage.toLowerCase()) {
            antiSpam.duplicateCount++;
            if (antiSpam.duplicateCount >= SPAM_CONFIG.MAX_DUPLICATE_COUNT) {
                antiSpam.violations++;
                return res.status(429).json({
                    error: "Не надсилайте однакові повідомлення. Це вважається спамом."
                });
            }
        } else {
            antiSpam.duplicateCount = 0;
        }

        antiSpam.burstMessages = antiSpam.burstMessages.filter(
            timestamp => now - timestamp < SPAM_CONFIG.BURST_WINDOW
        );

        if (antiSpam.burstMessages.length >= SPAM_CONFIG.BURST_LIMIT) {
            antiSpam.violations++;
            if (antiSpam.violations >= 2) {
                session.mentorResetTime = now + COOLDOWN_MS;
                session.mentorCount = LIMIT;
                return res.status(429).json({
                    error: "Спам виявлено. Заблоковано на 5 хвилин.",
                    resetTime: session.mentorResetTime
                });
            }

            return res.status(429).json({
                error: "Занадто багато повідомлень. Зачекайте 30 секунд."
            });
        }

        antiSpam.burstMessages.push(now);

        if (session.mentorResetTime && now >= session.mentorResetTime) {
            session.mentorCount = 0;
            session.mentorResetTime = null;
            antiSpam.violations = 0;
        }

        if (session.mentorResetTime && now < session.mentorResetTime) {
            return res.status(403).json({
                error: "Ліміт вичерпано.",
                resetTime: session.mentorResetTime,
                status: {
                    count: session.mentorCount || LIMIT,
                    limit: LIMIT,
                    resetTime: session.mentorResetTime
                }
            });
        }

        session.mentorCount = (session.mentorCount || 0) + 1;
        if (session.mentorCount >= LIMIT) {
            session.mentorResetTime = now + COOLDOWN_MS;
        }
        antiSpam.lastMessageTime = now;
        antiSpam.lastMessage = trimmedMessage;
        if (antiSpam.violations > 0) {
            antiSpam.violations = Math.max(0, antiSpam.violations - 0.5);
        }
        const response = await aiService.generateResponse(trimmedMessage, history);

        res.json({
            response,
            status: {
                count: session.mentorCount,
                limit: LIMIT,
                resetTime: session.mentorResetTime || null
            }
        });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI ментор зараз відпочиває." });
    }
});

module.exports = router;