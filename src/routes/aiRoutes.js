const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

const LIMIT = 10;
const COOLDOWN_MS = 5 * 60 * 1000;

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
        if (session.mentorResetTime && now >= session.mentorResetTime) {
            session.mentorCount = 0;
            session.mentorResetTime = null;
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
        const { message, history } = req.body;
        const response = await aiService.generateResponse(message, history);

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