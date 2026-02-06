const fs = require('fs');
const path = require('path');

class RoadmapService {
    get roadmapsPath() {
        return path.join(__dirname, '../../content/roadmaps');
    }

    async listRoadmaps() {
        try {
            if (!fs.existsSync(this.roadmapsPath)) return [];
            const files = fs.readdirSync(this.roadmapsPath).filter(f => f.endsWith('.json'));
            return files.map(file => {
                const content = JSON.parse(fs.readFileSync(path.join(this.roadmapsPath, file), 'utf-8'));
                return {
                    id: file.replace('.json', ''),
                    title: content.title,
                    description: content.description,
                    icon: content.icon || '🚀'
                };
            });
        } catch (error) {
            console.error('Error listing roadmaps:', error);
            return [];
        }
    }

    async getRoadmapData(roadmapId) {
        const roadmapPath = path.join(this.roadmapsPath, `${roadmapId}.json`);
        if (!fs.existsSync(roadmapPath)) throw new Error('Карту не знайдено');
        return JSON.parse(fs.readFileSync(roadmapPath, 'utf-8'));
    }
}

module.exports = new RoadmapService();