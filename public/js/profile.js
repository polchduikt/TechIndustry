async function loadUserProfile() {
    try {
        const response = await fetch('/api/auth/profile');
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
                avatarContainer.textContent = initials;
            }

            loadUserStats();
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        window.location.href = '/login';
    }
}

function loadUserStats() {
    const coursesCount = document.querySelectorAll('.course-progress-card').length;
    const completedCount = document.querySelectorAll('.course-badge.completed').length;
    document.getElementById('coursesCount').textContent = coursesCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('streakDays').textContent = "5";
}

function filterCourses(filter) {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.course-progress-card');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.filter === filter));

    cards.forEach(card => {
        const show = filter === 'all' || card.dataset.status === filter || card.dataset.category === filter;
        card.style.display = show ? 'block' : 'none';
    });
}

loadUserProfile();