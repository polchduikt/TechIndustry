const track = document.getElementById('carouselTrack');
const container = document.getElementById('carouselContainer');

if (track && container) {
    let isDragging = false;
    let startX;
    let currentTranslate = 0;
    const cards = Array.from(track.children);
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    function updateCarousel() {
        if (!isDragging) {
            currentTranslate -= 1;
            if (Math.abs(currentTranslate) >= track.scrollWidth / 2) {
                currentTranslate = 0;
            }
            track.style.transform = `translateX(${currentTranslate}px)`;
        }
        requestAnimationFrame(updateCarousel);
    }

    requestAnimationFrame(updateCarousel);

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - currentTranslate;
        container.classList.add('active');
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
        container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        currentTranslate = e.pageX - startX;

        if (currentTranslate > 0) {
            currentTranslate = -(track.scrollWidth / 2);
        }
        if (Math.abs(currentTranslate) >= track.scrollWidth / 2) {
            currentTranslate = 0;
        }
        track.style.transform = `translateX(${currentTranslate}px)`;
    });

    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX - currentTranslate;
    });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentTranslate = e.touches[0].clientX - startX;
        track.style.transform = `translateX(${currentTranslate}px)`;
    });
}

async function updateGlobalHeader() {
    const authSlot = document.getElementById('authSlot');
    const myLearningBtn = document.getElementById('myLearningBtn');

    if (!authSlot) return;

    try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
            const data = await response.json();
            const username = data.username;

            const avatarSrc = data.Customer?.avatar_data ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`;

            if (myLearningBtn) myLearningBtn.style.display = 'block';

            authSlot.innerHTML = `
                <div class="user-menu">
                    <div class="user-avatar" onclick="toggleDropdown()">
                        <img src="${avatarSrc}" alt="Avatar" id="headerAvatarImg" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                    </div>
                    <div class="dropdown-menu" id="dropdownMenu">
                        <a href="/profile" class="dropdown-item">👤 Профіль</a>
                        <a href="/settings" class="dropdown-item">⚙️ Налаштування</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" onclick="logout(event)" class="dropdown-item logout">🚪 Вийти</a>
                    </div>
                </div>`;
        } else {
            resetHeader();
        }
    } catch (error) {
        resetHeader();
    }
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
        resetHeader();
        window.location.href = '/'; // Перенаправлення на головну після виходу
    } catch (error) {
        console.error('Помилка виходу:', error);
        window.location.href = '/';
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('dropdownMenu');

    if (dropdown && userMenu && !userMenu.contains(e.target) && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', updateGlobalHeader);