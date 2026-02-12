function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

function filterCategory(categorySlug) {
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === categorySlug);
    });
    const items = document.querySelectorAll('.shop-card');
    items.forEach(item => {
        if (categorySlug === 'all' || item.dataset.category === categorySlug) {
            item.style.display = 'flex';
            setTimeout(() => item.style.opacity = '1', 50);
        } else {
            item.style.display = 'none';
            item.style.opacity = '0';
        }
    });
}

async function purchaseItem(itemId, price, btnElement) {
    const balanceEl = document.getElementById('userBalance');
    const currentBalance = parseInt(balanceEl.textContent);
    if (currentBalance < price) {
        showNotification('Недостатньо монет! 🪙', 'error');
        btnElement.classList.add('shake');
        setTimeout(() => btnElement.classList.remove('shake'), 500);
        return;
    }
    if (!confirm(`Купити цей предмет за ${price} монет?`)) return;
    const originalText = btnElement.textContent;
    btnElement.textContent = '⏳';
    btnElement.disabled = true;

    try {
        const response = await fetch('/api/shop/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({ itemId })
        });

        const result = await response.json();

        if (response.ok) {
            animateValue(balanceEl, currentBalance, result.newBalance, 1000);
            btnElement.className = 'btn-buy purchased';
            btnElement.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Куплено';
            triggerConfetti();
            showNotification('Покупка успішна! 🎉', 'success');
        } else {
            showNotification(result.error || 'Помилка покупки', 'error');
            btnElement.textContent = originalText;
            btnElement.disabled = false;
        }
    } catch (error) {
        console.error(error);
        showNotification('Помилка з\'єднання', 'error');
        btnElement.textContent = originalText;
        btnElement.disabled = false;
    }
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function triggerConfetti() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '30px';
    notification.style.right = '30px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '12px';
    notification.style.background = type === 'success' ? '#10b981' : '#ef4444';
    notification.style.color = 'white';
    notification.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.animation = 'slideIn 0.3s ease';
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
.shake { animation: shake 0.3s; }
`;
document.head.appendChild(style);