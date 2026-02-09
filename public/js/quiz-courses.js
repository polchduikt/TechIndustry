function filterQuizzes(category, btn) {
    document.querySelectorAll('.category-tab').forEach(el => el.classList.remove('active-tab'));
    btn.classList.add('active-tab');
    const cards = document.querySelectorAll('.quiz-card');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex';
            card.classList.add('animate-fade-in');
        } else {
            card.style.display = 'none';
        }
    });
}