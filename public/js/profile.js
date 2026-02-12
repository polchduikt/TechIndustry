function filterCourses(filter) {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.course-progress-card');
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.filter === filter));
    cards.forEach(card => {
        const status = card.dataset.status;
        const category = card.dataset.category;
        let show = (filter === 'all') || (filter === status) || (filter === category);
        card.style.display = show ? 'block' : 'none';
    });
}

function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

async function equipItem(itemId) {
    try {
        showNotification('⏳ Надягаємо...', 'info');

        const response = await fetch('/api/shop/equip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({ itemId })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('✓ Предмет успішно надягнуто!', 'success');

            // Оновлюємо UI без перезавантаження
            await updateInventoryUI(itemId, 'equip');

        } else {
            showNotification(result.message || 'Помилка', 'error');
        }
    } catch (error) {
        console.error('Equip error:', error);
        showNotification('Помилка з\'єднання', 'error');
    }
}

async function unequipItem(itemId) {
    try {
        showNotification('⏳ Знімаємо...', 'info');

        const response = await fetch('/api/shop/unequip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({ itemId })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('✓ Предмет знято', 'info');
            await updateInventoryUI(itemId, 'unequip');
        } else {
            showNotification(result.message || 'Помилка', 'error');
        }
    } catch (error) {
        console.error('Unequip error:', error);
        showNotification('Помилка з\'єднання', 'error');
    }
}

async function updateInventoryUI(itemId, action) {
    const currentCard = document.querySelector(`.inventory-item[data-item-id="${itemId}"]`);
    if (!currentCard) {
        console.warn('Card not found for item:', itemId);
        return;
    }
    const itemType = currentCard.dataset.type;
    if (action === 'equip') {
        const sameTypeCards = document.querySelectorAll(`.inventory-item[data-type="${itemType}"]`);
        sameTypeCards.forEach(card => {
            card.classList.remove('equipped');
            const badge = card.querySelector('.equipped-badge');
            if (badge) badge.remove();
            const actionsDiv = card.querySelector('.item-actions');
            if (actionsDiv) {
                const cardItemId = card.dataset.itemId;
                actionsDiv.innerHTML = `
                    <button class="btn-item-action btn-equip" onclick="equipItem(${cardItemId})">
                        Надягти
                    </button>
                `;
            }
        });
        currentCard.classList.add('equipped');

        const preview = currentCard.querySelector('.item-preview');
        if (preview && !preview.querySelector('.equipped-badge')) {
            const badge = document.createElement('div');
            badge.className = 'equipped-badge';
            badge.textContent = 'Надягнуто';
            preview.appendChild(badge);
        }
        const actionsDiv = currentCard.querySelector('.item-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = `
                <button class="btn-item-action btn-unequip" onclick="unequipItem(${itemId})">
                    Зняти
                </button>
            `;
        }
        await updateProfilePreview(itemType, itemId);
    } else if (action === 'unequip') {
        currentCard.classList.remove('equipped');
        const badge = currentCard.querySelector('.equipped-badge');
        if (badge) badge.remove();
        const actionsDiv = currentCard.querySelector('.item-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = `
                <button class="btn-item-action btn-equip" onclick="equipItem(${itemId})">
                    Надягти
                </button>
            `;
        }
        await updateProfilePreview(itemType, null);
    }
}

async function updateProfilePreview(itemType, itemId) {
    if (itemType === 'avatar_frame') {
        const frameOverlay = document.querySelector('.profile-avatar-large .frame-overlay');
        if (itemId) {
            const card = document.querySelector(`.inventory-item[data-item-id="${itemId}"]`);
            if (card) {
                const itemValue = card.querySelector('use')?.getAttribute('href')?.replace('#frame-', '');
                if (itemValue) {
                    if (frameOverlay) {
                        const use = frameOverlay.querySelector('use');
                        if (use) {
                            use.setAttribute('href', `#frame-${itemValue}`);
                        }
                    } else {
                        const avatar = document.querySelector('.profile-avatar-large');
                        if (avatar) {
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('class', 'frame-overlay');
                            svg.setAttribute('viewBox', '0 0 140 140');
                            const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                            use.setAttribute('href', `#frame-${itemValue}`);

                            svg.appendChild(use);
                            avatar.insertBefore(svg, avatar.firstChild);
                        }
                    }
                }
            }
        } else {
            if (frameOverlay) {
                frameOverlay.remove();
            }
        }
    }
    if (itemType === 'profile_theme') {
        const profileHeader = document.querySelector('.profile-header');

        if (itemId) {
            const card = document.querySelector(`.inventory-item[data-item-id="${itemId}"]`);
            if (card) {
                const itemValue = card.querySelector('use')?.getAttribute('href')?.replace('#theme-', '');

                if (itemValue && profileHeader) {
                    profileHeader.className = profileHeader.className.replace(/theme-\w+/g, '');
                    profileHeader.classList.add(`theme-${itemValue}`);
                }
            }
        } else {
            if (profileHeader) {
                profileHeader.className = profileHeader.className.replace(/theme-\w+/g, '');
                profileHeader.classList.add('theme-default');
            }
        }
    }
    const avatar = document.querySelector('.profile-avatar-large');
    const header = document.querySelector('.profile-header');
    const target = itemType === 'avatar_frame' ? avatar : header;
    if (target) {
        target.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            target.style.animation = '';
        }, 500);
    }
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 30px;
        padding: 14px 24px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        animation: slideInRight 0.3s ease forwards;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 200px;
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.innerHTML = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);
}

window.equipItem = equipItem;
window.unequipItem = unequipItem;
window.filterCourses = filterCourses;