const track = document.getElementById('carouselTrack');
const container = document.getElementById('carouselContainer');

if (track && container) {
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let speed = 0.7;
    let raf;
    track.style.transition = 'none';
    const cards = Array.from(track.children);
    if (cards.length > 0) {
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });
    }

    const getHalfWidth = () => track.scrollWidth / 2;
    function animate() {
        if (!isDragging) {
            currentTranslate += speed;
            const halfWidth = getHalfWidth();
            if (currentTranslate >= halfWidth) {
                currentTranslate = 0;
            }
            track.style.transform = `translateX(${-currentTranslate}px)`;
        }
        raf = requestAnimationFrame(animate);
    }
    animate();

    container.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.clientX;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        currentTranslate -= deltaX;
        startX = e.clientX;
        const halfWidth = getHalfWidth();
        if (currentTranslate < 0) currentTranslate = halfWidth;
        if (currentTranslate >= halfWidth) currentTranslate = 0;
        track.style.transform = `translateX(${-currentTranslate}px)`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('touchstart', e => {
        isDragging = true;
        startX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener('touchmove', e => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        currentTranslate -= deltaX;
        startX = e.touches[0].clientX;
        track.style.transform = `translateX(${-currentTranslate}px)`;
    }, { passive: true });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });
}
