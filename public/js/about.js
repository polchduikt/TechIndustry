const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));

function animateCounter(el, target, suffix) {
    const duration = 1800;
    const start = performance.now();
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = (target >= 1000 ? current.toLocaleString() : current) + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target.querySelector('.about-stats__number');
            const target = parseInt(el.dataset.target);
            const suffix = el.textContent.includes('%') ? '%' : (target >= 1000 ? '+' : '');
            animateCounter(el, target, suffix);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 });
document.querySelectorAll('.about-stats__item').forEach(el => counterObserver.observe(el));