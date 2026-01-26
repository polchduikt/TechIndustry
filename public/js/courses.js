let allCourses = [];
let userProgress = [];
let userToken = null;

async function checkAuth() {
    userToken = localStorage.getItem('token');
    return !!userToken;
}

async function fetchCourses() {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; opacity: 0.6;">Завантаження курсів...</p>';

    try {
        const isAuth = await checkAuth();
        const coursesRes = await fetch('/api/courses');
        if (!coursesRes.ok) throw new Error('Не вдалося завантажити курси');
        allCourses = await coursesRes.json();

        if (isAuth) {
            const progressRes = await fetch('/api/progress', {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (progressRes.ok) {
                userProgress = await progressRes.json();
            }
        }

        renderCourses(allCourses);
    } catch (error) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #fca5a5;">Помилка: ${error.message}</p>`;
    }
}

function renderCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '';

    if (courses.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; opacity: 0.6;">Курсів не знайдено.</p>';
        return;
    }

    courses.forEach(course => {
        const progressEntry = userProgress.find(p => p.course_id === course.id);
        grid.appendChild(createCourseCard(course, progressEntry));
    });
}

function createCourseCard(course, progress) {
    const card = document.createElement('div');
    card.className = 'language-card glass';

    const icons = { frontend: '⚛️', backend: '🟢', data: '📊', mobile: '📱' };
    const icon = icons[course.category] || '⚡';

    let totalLessons = 0;
    course.modules?.forEach(m => totalLessons += m.lessons?.length || 0);

    const completedCount = progress?.completed_lessons?.length || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    let statusBadge = '';
    let btnText = 'Почати курс';

    if (progress) {
        if (progress.status === 'completed') {
            statusBadge = '<div class="course-badge completed" style="background: rgba(74, 222, 128, 0.2); color: #4ade80; padding: 4px 12px; border-radius: 20px; font-size: 12px; width: fit-content; margin-bottom: 12px;">Завершено</div>';
            btnText = 'Переглянути';
        } else {
            statusBadge = '<div class="course-badge in-progress" style="background: rgba(99, 102, 241, 0.2); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 12px; width: fit-content; margin-bottom: 12px;">У процесі</div>';
            btnText = 'Продовжити';
        }
    }

    card.innerHTML = `
        <div class="lang-header">
            <div class="lang-icon">${icon}</div>
            <div class="lang-info">
                ${statusBadge}
                <h3>${course.title}</h3>
                <div class="lang-level">${course.level}</div>
            </div>
        </div>
        <p style="color: var(--text-muted); margin-bottom: 16px; font-size: 14px;">${course.description}</p>
        
        ${progress ? `
            <div class="progress-info" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                    <span>Прогрес</span>
                    <span>${progressPercent}%</span>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">
                    <div style="width: ${progressPercent}%; height: 100%; background: var(--primary); transition: width 0.3s ease;"></div>
                </div>
            </div>
        ` : ''}

        <div class="lang-stats">
            <span>📚 ${totalLessons} уроків</span>
            <span>⏱️ ${totalLessons * 2} годин</span>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 12px;">
            <button class="btn btn-primary" style="flex: 1;" onclick="startCourse('${course.slug}')">${btnText}</button>
            <button class="btn btn-secondary" onclick="viewCourse('${course.slug}')">Детальніше</button>
        </div>
    `;
    return card;
}

async function startCourse(slug) {
    if (!await checkAuth()) {
        alert('Будь ласка, увійдіть, щоб почати курс');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/progress/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify({ courseSlug: slug })
        });

        if (response.ok) {
            window.location.href = `/course?course=${slug}`;
        } else {
            const error = await response.json();
            alert(error.message || 'Не вдалося почати курс');
        }
    } catch (error) {
        alert('Помилка з\'єднання. Спробуйте ще раз.');
    }
}

function viewCourse(slug) {
    window.location.href = `/course?course=${slug}`;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCourses();
});