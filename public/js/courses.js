let carouselPosition = 0;

    // --- CAROUSEL LOGIC ---
    function moveCarousel(direction) {
        const track = document.getElementById('carouselTrack');
        const cardWidth = 374; // Width (350) + Gap (24)
        const containerWidth = document.querySelector('.carousel-container').offsetWidth;
        const totalWidth = track.scrollWidth;
        const maxScroll = -(totalWidth - containerWidth);

        carouselPosition += direction * -cardWidth;
        
        // Boundaries
        if (carouselPosition > 0) carouselPosition = 0;
        if (carouselPosition < maxScroll) carouselPosition = maxScroll;
        
        track.style.transform = `translateX(${carouselPosition}px)`;
    }

    // --- CATALOG FILTERS ---
    function filterCategory(category, event) {
        const tabs = document.querySelectorAll('.category-tab');
        const cards = document.querySelectorAll('.language-card');
        
        tabs.forEach(tab => tab.classList.remove('active-tab'));
        event.target.classList.add('active-tab');
        
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
