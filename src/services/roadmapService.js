const fs = require('fs');
const path = require('path');

class RoadmapService {
    async getRoadmapData(roadmapId) {
        try {
            const roadmapPath = path.join(__dirname, '../../content/roadmaps', `${roadmapId}.json`);

            if (!fs.existsSync(roadmapPath)) {
                throw new Error('Карту за таким ID не знайдено');
            }

            const data = fs.readFileSync(roadmapPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(error.message || 'Не вдалося завантажити карту розвитку');
        }
    }
}

module.exports = new RoadmapService();