async function renderRoadmap(id) {
    const listEl = document.getElementById('roadmapList');
    const viewEl = document.getElementById('roadmapView');
    const container = document.getElementById('roadmapContainer');

    listEl.style.display = 'none';
    viewEl.style.display = 'block';

    container.innerHTML = `
        <div class="glass" style="padding: 60px; text-align: center; border-radius: 24px;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 20px; opacity: 0.6;">Будуємо ваш шлях розвитку...</p>
        </div>`;

    try {
        const res = await fetch(`/api/roadmaps/${id}`);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Помилка сервера');
        }

        const data = await res.json();

        container.innerHTML = `
            <div class="roadmap-header glass">
                <h1 class="gradient-text">${data.title}</h1>
                <p>${data.description}</p>
            </div>
            
            <div class="roadmap-tree">
                ${data.phases.map((phase, index) => `
                    <div class="roadmap-phase glass" style="animation-delay: ${index * 0.1}s">
                        <div class="phase-number">${index + 1}</div>
                        <h3>${phase.name}</h3>
                        <div class="topic-list">
                            ${phase.topics.map(topic => `
                                <div class="topic-tag ${topic.important ? 'important' : ''}">
                                    <span>${topic.name}</span>
                                    ${topic.link ? `
                                        <a href="${topic.link}" ${topic.link.startsWith('http') ? 'target="_blank"' : ''} class="topic-link">
                                            ${topic.link.includes('roadmap.sh') ? '📖' : '🎓'}
                                        </a>` : ''
        }
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="roadmap-end glass">Ви досягли мети! 🎉</div>
            </div>
        `;

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (e) {
        container.innerHTML = `
            <div class="glass" style="padding: 40px; text-align: center; border-color: var(--accent);">
                <h3 style="color: var(--accent); margin-bottom: 16px;">Упс! Сталася помилка</h3>
                <p>${e.message}</p>
                <button class="btn btn-primary" onclick="showSelection()" style="margin-top: 24px;">Спробувати інший напрям</button>
            </div>`;
    }
}

function showSelection() {
    document.getElementById('roadmapList').style.display = 'grid';
    document.getElementById('roadmapView').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}