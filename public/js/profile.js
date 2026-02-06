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