const track = document.getElementById('carouselTrack');
const container = document.getElementById('carouselContainer');

if (track && container) {
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let speed = 0.7;
    let raf;
    track.style.transition = 'none';

    const cards = Array.from(track.children);
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    const getHalfWidth = () => track.scrollWidth / 2;

    function animate() {
        if (!isDragging) {
            currentTranslate += speed;
            const halfWidth = getHalfWidth();
            if (currentTranslate >= halfWidth) {
                currentTranslate = 0;
            }

            track.style.transform = `translateX(${-currentTranslate}px)`;
        }
        raf = requestAnimationFrame(animate);
    }

    animate();

    container.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.clientX;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        currentTranslate -= deltaX;
        startX = e.clientX;
        const halfWidth = getHalfWidth();
        if (currentTranslate < 0) currentTranslate = halfWidth;
        if (currentTranslate >= halfWidth) currentTranslate = 0;

        track.style.transform = `translateX(${-currentTranslate}px)`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('touchstart', e => {
        isDragging = true;
        startX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener('touchmove', e => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        currentTranslate -= deltaX;
        startX = e.touches[0].clientX;
        track.style.transform = `translateX(${-currentTranslate}px)`;
    }, { passive: true });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });
}

async function updateGlobalHeader() {
    const authSlot = document.getElementById('authSlot');
    const myLearningBtn = document.getElementById('myLearningBtn');
    if (!authSlot) return;

    try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            renderUserMenu(data, authSlot, myLearningBtn);
        } else {
            resetHeader();
        }
    } catch {
        resetHeader();
    }
}

function renderUserMenu(data, authSlot, myLearningBtn) {
    if (myLearningBtn) myLearningBtn.style.display = 'block';
    const avatar = data.Customer?.avatar_data ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=6366f1&color=fff`;

    authSlot.innerHTML = `
        <div class="user-menu">
            <div class="user-avatar" onclick="toggleDropdown()">
                <img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
            </div>
            <div class="dropdown-menu" id="dropdownMenu">
                <a href="/profile" class="dropdown-item">👤 Профіль</a>
                <a href="/settings" class="dropdown-item">⚙️ Налаштування</a>
                <div class="dropdown-divider"></div>
                <a href="#" onclick="logout(event)" class="dropdown-item logout">🚪 Вийти</a>
            </div>
        </div>
    `;
}

function resetHeader() {
    const authSlot = document.getElementById('authSlot');
    const myLearningBtn = document.getElementById('myLearningBtn');
    if (myLearningBtn) myLearningBtn.style.display = 'none';
    if (authSlot) {
        authSlot.innerHTML = `<button class="btn btn-primary" onclick="location.href='/login'">Увійти</button>`;
    }
}

async function logout(event) {
    if (event) event.preventDefault();
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('token');
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
        resetHeader();
        window.location.replace('/');
    } catch (error) {
        console.error('Relogin error:', error);
        localStorage.removeItem('token');
        window.location.replace('/');
    }
}

function toggleDropdown() {
    document.getElementById('dropdownMenu')?.classList.toggle('show');
}

document.addEventListener('click', e => {
    const menu = document.querySelector('.user-menu');
    if (menu && !menu.contains(e.target)) {
        document.getElementById('dropdownMenu')?.classList.remove('show');
    }
});

window.addEventListener('pageshow', e => { if (e.persisted) updateGlobalHeader(); });
document.addEventListener('DOMContentLoaded', updateGlobalHeader);