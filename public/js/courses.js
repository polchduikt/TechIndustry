let allCourses = [];
let userToken = null;

async function checkAuth() {
    userToken = localStorage.getItem('token');
    return !!userToken;
}

async function fetchCourses() {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; opacity: 0.6;">Loading courses...</p>';

    try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to load courses');

        allCourses = await res.json();
        renderCourses(allCourses);
    } catch (error) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #fca5a5;">Error: ${error.message}</p>`;
    }
}

function renderCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '';

    if (courses.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; opacity: 0.6;">No courses found for this category.</p>';
        return;
    }

    courses.forEach(course => {
        const card = createCourseCard(course);
        grid.appendChild(card);
    });
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'language-card glass';
    card.dataset.category = course.category;

    const icons = {
        frontend: '⚛️',
        backend: '🟢',
        data: '📊',
        mobile: '📱'
    };

    const icon = icons[course.category] || '⚡';

    const levelTranslations = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
    };

    const levelEng = levelTranslations[course.level] || course.level;

    let totalLessons = 0;
    let totalHours = 0;

    if (course.modules && course.modules.length > 0) {
        course.modules.forEach(module => {
            if (module.lessons) {
                totalLessons += module.lessons.length;
            }
        });
        totalHours = totalLessons * 2;
    }

    card.innerHTML = `
    <div class="lang-header">
        <div class="lang-icon">${icon}</div>
        <div class="lang-info">
            <h3>${course.title}</h3>
            <div class="lang-level">${levelEng}</div>
        </div>
    </div>
    <p style="color: var(--text-muted); margin-bottom: 16px; font-size: 14px; line-height: 1.5;">
        ${course.description}
    </p>
    <div class="lang-stats">
        <span>📚 ${totalLessons || 'N/A'} уроків</span>
        <span>⏱️ ${totalHours || 'N/A'} годин</span>
        <span>🎓 ${course.modules?.length || 0} модулів</span>
    </div>
    <div style="margin-top: 20px; display: flex; gap: 12px;">
        <button class="btn btn-primary" style="flex: 1;" onclick="startCourse('${course.slug}')">
            Почати курс
        </button>
        <button class="btn btn-secondary" onclick="viewCourse('${course.slug}')">
            Детальніше
        </button>
    </div>
    `;
    return card;
}

function filterCourses(category, button) {
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active-tab'));
    button.classList.add('active-tab');

    if (category === 'all') {
        renderCourses(allCourses);
    } else {
        const filtered = allCourses.filter(c => c.category === category);
        renderCourses(filtered);
    }
}

async function startCourse(slug) {
    const isAuth = await checkAuth();

    if (!isAuth) {
        alert('Please log in to start the course');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/progress/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ courseSlug: slug })
        });

        if (response.ok) {
            window.location.href = `/course?course=${slug}`;
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to start the course');
        }
    } catch (error) {
        console.error('Error starting course:', error);
        alert('An error occurred. Please try again.');
    }
}

function viewCourse(slug) {
    window.location.href = `/course?course=${slug}`;
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchCourses();
});
