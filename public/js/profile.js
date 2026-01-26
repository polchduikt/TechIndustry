let currentFilter = 'all';
let userProgressData = [];

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('profileUsername').textContent = data.username;
            document.getElementById('profileEmail').textContent = data.Customer?.email || '';
            const initials = data.username.substring(0, 2).toUpperCase();
            const avatarImg = data.Customer?.avatar_data;
            const avatarContainer = document.querySelector('.profile-avatar-large');
            if (avatarImg) {
                avatarContainer.innerHTML = `<img src="${avatarImg}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                document.getElementById('profileInitials').textContent = initials;
            }
            await loadUserProgress();
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = '/login';
    }
}

async function loadUserProgress() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/progress', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load progress');
        }

        userProgressData = await response.json();
        renderUserCourses(userProgressData);
        updateUserStats(userProgressData);

    } catch (error) {
        console.error('Error loading progress:', error);
        const grid = document.getElementById('coursesGrid');
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📚</div>
                <h3 style="margin-bottom: 12px;">Ви ще не почали жодного курсу</h3>
                <p style="color: var(--text-muted); margin-bottom: 24px;">
                    Перейдіть до каталогу та оберіть курс для навчання
                </p>
                <button class="btn btn-primary" onclick="location.href='/courses'">
                    Переглянути курси
                </button>
            </div>
        `;
    }
}

function renderUserCourses(progressList) {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '';

    if (!progressList || progressList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📚</div>
                <h3 style="margin-bottom: 12px;">Ви ще не почали жодного курсу</h3>
                <p style="color: var(--text-muted); margin-bottom: 24px;">
                    Перейдіть до каталогу та оберіть курс для навчання
                </p>
                <button class="btn btn-primary" onclick="location.href='/courses'">
                    Переглянути курси
                </button>
            </div>
        `;
        return;
    }

    progressList.forEach(progress => {
        const course = progress.course;
        if (!course) return;
        const totalLessons = calculateTotalLessons(course);
        const completedLessons = progress.completed_lessons?.length || 0;
        const progressPercent = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
        const totalHours = totalLessons * 2;
        const completedHours = completedLessons * 2;

        const card = createCourseProgressCard(
            course,
            progress,
            totalLessons,
            completedLessons,
            progressPercent,
            totalHours,
            completedHours
        );

        grid.appendChild(card);
    });
    filterCourses(currentFilter);
}

function calculateTotalLessons(course) {
    let total = 0;
    if (course.modules && course.modules.length > 0) {
        course.modules.forEach(module => {
            if (module.lessons) {
                total += module.lessons.length;
            }
        });
    }
    return total;
}

function createCourseProgressCard(course, progress, totalLessons, completedLessons, progressPercent, totalHours, completedHours) {
    const card = document.createElement('div');
    card.className = 'course-progress-card glass';
    card.dataset.status = progress.status;
    card.dataset.category = course.category || 'other';

    const icons = { frontend: '⚛️', backend: '🟢', data: '📊', mobile: '📱' };
    const icon = icons[course.category] || '⚡';
    const statusLabels = { 'not_started': 'Не розпочато', 'in_progress': 'В процесі', 'completed': 'Завершено' };
    const statusClass = progress.status === 'completed' ? 'completed' : 'in-progress';
    const statusLabel = statusLabels[progress.status] || 'В процесі';
    const isCompleted = progress.status === 'completed';

    const certificateBtn = `
        <button class="btn ${isCompleted ? 'btn-primary' : 'btn-secondary'}" 
                style="width: 100%; margin-top: 12px; ${!isCompleted ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
                ${isCompleted ? '' : 'disabled'} 
                onclick="downloadCertificate('${course.id}')">
            Отримати сертифікат
        </button>`;

    card.innerHTML = `
        <div class="course-header">
            <div class="course-icon-small" style="background: rgba(99, 102, 241, 0.2);">${icon}</div>
            <div class="course-badge ${statusClass}">${statusLabel}</div>
        </div>
        <h3 class="course-name">${course.title}</h3>
        <p class="course-progress-text">${completedLessons} з ${totalLessons} уроків завершено</p>
        <div class="progress-bar-container">
            <div class="progress-bar-fill ${isCompleted ? 'completed' : ''}" style="width: ${progressPercent}%"></div>
        </div>
        <div class="course-meta-small">
            <span>⏱️ ${completedHours}/${totalHours} год</span>
            <span class="progress-percent">${progressPercent}%</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
            <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-continue" 
                    onclick="location.href='/course?course=${course.slug}'">
                ${isCompleted ? 'Переглянути курс' : 'Продовжити навчання'}
            </button>
            ${certificateBtn}
        </div>
    `;
    return card;
}

function downloadCertificate(courseId) {
    window.location.href = `/certificate?course=${courseId}`;
}

function updateUserStats(progressList) {
    const totalCourses = progressList.length;
    const completedCourses = progressList.filter(p => p.status === 'completed').length;
    document.getElementById('coursesCount').textContent = totalCourses;
    document.getElementById('completedCount').textContent = completedCourses;
    document.getElementById('streakDays').textContent = calculateStreakDays(progressList);
}

function calculateStreakDays(progressList) {
    if (progressList.length === 0) return 0;
    const lastAccessed = progressList
        .map(p => new Date(p.last_accessed))
        .sort((a, b) => b - a)[0];
    const today = new Date();
    const diffTime = Math.abs(today - lastAccessed);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1 ? Math.max(1, diffDays) : 0;
}

function filterCourses(filter) {
    currentFilter = filter;
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.course-progress-card');
    const emptyState = document.getElementById('emptyState');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    let visibleCount = 0;
    cards.forEach(card => {
        let show = false;

        if (filter === 'all') {
            show = true;
        } else if (filter === 'in-progress') {
            show = card.dataset.status === 'in_progress';
        } else if (filter === 'completed') {
            show = card.dataset.status === 'completed';
        } else {
            show = card.dataset.category === filter;
        }

        card.style.display = show ? 'block' : 'none';
        if (show) visibleCount++;
    });

    if (visibleCount === 0 && cards.length > 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});