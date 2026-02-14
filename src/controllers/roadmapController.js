const roadmapService = require('../services/roadmapService');

exports.renderRoadmapSelection = async (req, res) => {
    try {
        const roadmaps = await roadmapService.listRoadmaps();
        res.render('roadmap-selection', {
            title: 'Роадмапи | TechIndustry',
            metaDescription: 'Дорожні карти навчання IT: покрокові шляхи для Frontend, Backend, DevOps та інших напрямків програмування.',
            ogTitle: 'IT Роадмапи — Шляхи навчання програмуванню',
            ogDescription: 'Структуровані шляхи навчання для різних IT спеціалізацій на TechIndustry.',
            extraCss: ['/css/roadmap.css'],
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
            title: `${roadmapData.title} | TechIndustry`,
            metaDescription: roadmapData.description
                ? `${roadmapData.description.substring(0, 150)}...`
                : `Дорожня карта навчання: ${roadmapData.title}. Покроковий план розвитку на TechIndustry.`,
            ogTitle: `Роадмап: ${roadmapData.title}`,
            ogDescription: `Структурований шлях навчання ${roadmapData.title} з детальним планом та ресурсами.`,
            extraCss: ['/css/roadmap.css'],
            roadmap: roadmapData
        });
    } catch (error) {
        res.status(404).render('error', { message: 'Шлях не знайдено' });
    }
};