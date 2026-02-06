const roadmapService = require('../services/roadmapService');

exports.renderRoadmapSelection = async (req, res) => {
    try {
        const roadmaps = await roadmapService.listRoadmaps();
        res.render('roadmap-selection', {
            title: 'Роадмапи | TechIndustry',
            roadmaps
        });
    } catch (e) {
        res.status(500).send('Помилка завантаження');
    }
};

exports.renderRoadmapDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const roadmapData = await roadmapService.getRoadmapData(id);
        res.render('roadmap-view', {
            title: `Шлях: ${roadmapData.title}`,
            roadmap: roadmapData
        });
    } catch (error) {
        res.status(404).render('error', { message: 'Шлях не знайдено' });
    }
};