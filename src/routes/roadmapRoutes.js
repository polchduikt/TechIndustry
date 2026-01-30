const express = require('express');
const router = express.Router();
const roadmapService = require('../services/roadmapService');

router.get('/:id', async (req, res) => {
    try {
        const data = await roadmapService.getRoadmapData(req.params.id);
        res.json(data);
    } catch (error) {
        console.error("Roadmap API Error:", error.message);
        res.status(500).json({
            message: 'Помилка завантаження даних з roadmap.sh',
            details: error.message
        });
    }
});

module.exports = router;