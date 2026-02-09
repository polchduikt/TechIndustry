function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

function filterCourses(category, element) {
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active-tab'));
    element.classList.add('active-tab');
    const cards = document.querySelectorAll('.language-card');
    cards.forEach(card => {
        const cardCat = card.dataset.category;
        card.style.display = (category === 'all' || cardCat === category) ? 'block' : 'none';
    });
}

async function startCourse(slug) {
    try {
        const response = await fetch('/api/progress/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': getCsrfToken()
            },
            credentials: 'same-origin',
            body: JSON.stringify({ courseSlug: slug })
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
            return;
        }
        if (!response.ok) {
            throw new Error('Помилка початку курсу');
        }
        window.location.href = `/course/${slug}`;
    } catch (error) {
        console.error('Start course error:', error);
        window.location.href = '/login';
    }
}