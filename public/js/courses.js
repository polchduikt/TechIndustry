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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseSlug: slug })
        });
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        window.location.href = `/course/${slug}`;
    } catch (error) {
        window.location.href = '/login';
    }
}