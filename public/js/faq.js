document.querySelectorAll('.faq-item__head').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(other => {
            if (other !== item) {
                other.classList.remove('open');
                const body = other.querySelector('.faq-item__body');
                body.style.maxHeight = '0';
            }
        });
        item.classList.toggle('open', !isOpen);
        const body = item.querySelector('.faq-item__body');
        body.style.maxHeight = isOpen ? '0' : body.scrollHeight + 'px';
    });
});

document.querySelectorAll('.faq-cat').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.faq-cat').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        document.querySelectorAll('.faq-group').forEach(group => {
            const match = cat === 'all' || group.dataset.cat === cat;
            group.style.display = match ? '' : 'none';
        });
        toggleEmpty();
    });
});

document.getElementById('faqSearch').addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    document.querySelectorAll('.faq-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
    });
    document.querySelectorAll('.faq-group').forEach(group => {
        const visible = [...group.querySelectorAll('.faq-item')].some(i => i.style.display !== 'none');
        group.style.display = visible ? '' : 'none';
    });
    toggleEmpty();
});

function toggleEmpty() {
    const anyVisible = [...document.querySelectorAll('.faq-group')].some(g => g.style.display !== 'none');
    document.getElementById('faqEmpty').style.display = anyVisible ? 'none' : 'flex';
}

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
reveals.forEach(el => observer.observe(el));