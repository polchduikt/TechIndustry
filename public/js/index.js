const track = document.getElementById('carouselTrack');
const container = document.getElementById('carouselContainer');

if (track && container) {
    const originalCards = Array.from(track.children);
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let speed = 0.7;
    let animationId;

    function getSetWidth() {
        let width = 0;
        originalCards.forEach(card => {
            width += card.offsetWidth;
            const style = window.getComputedStyle(card);
            const marginRight = parseFloat(style.marginRight) || 0;
            const marginLeft = parseFloat(style.marginLeft) || 0;
            width += marginRight + marginLeft;
        });
        width += 24 * (originalCards.length - 1);
        return width;
    }

    let setWidth = getSetWidth();

    function animate() {
        if (!isDragging) {
            currentTranslate += speed;
        }

        if (currentTranslate >= setWidth) {
            currentTranslate = currentTranslate - setWidth;
            prevTranslate = currentTranslate;
        } else if (currentTranslate < 0) {
            currentTranslate = setWidth + currentTranslate;
            prevTranslate = currentTranslate;
        }

        track.style.transform = `translateX(${-currentTranslate}px)`;
        animationId = requestAnimationFrame(animate);
    }
    animate();

    const handleStart = (clientX) => {
        isDragging = true;
        startX = clientX;
        prevTranslate = currentTranslate;
        container.style.cursor = 'grabbing';
    };

    const handleMove = (clientX) => {
        if (!isDragging) return;
        const diff = clientX - startX;
        currentTranslate = prevTranslate - diff;
    };

    const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = 'grab';
        prevTranslate = currentTranslate;
    };

    container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
        handleMove(e.clientX);
    });

    window.addEventListener('mouseup', handleEnd);

    container.addEventListener('mouseleave', () => {
        if (isDragging) handleEnd();
    });

    container.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX);
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        handleMove(e.touches[0].clientX);
    }, { passive: true });

    container.addEventListener('touchend', handleEnd);

    window.addEventListener('resize', () => {
        setWidth = getSetWidth();
    });

    container.style.cursor = 'grab';
    container.style.userSelect = 'none';
    track.style.transition = 'none';
}