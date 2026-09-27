// assets/js/modules/uiHelpers.js

function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = 0;
            }
        });
    });
}

function initHeaderManager() {
    const headerElement = document.querySelector('header');
    if (!headerElement) return;

    const updateHeight = () => {
        let actualHeaderHeight = headerElement.offsetHeight;
        document.documentElement.style.setProperty('--current-header-height', `${actualHeaderHeight}px`);
    };

    window.addEventListener('resize', updateHeight);
    new ResizeObserver(updateHeight).observe(headerElement);
    updateHeight(); // Initial call
}

// --- REVERTED to simpler, more reliable flip logic ---
function initFlipCards() {
    const newsGrid = document.getElementById('news-card-grid');
    if (!newsGrid) return;

    newsGrid.addEventListener('click', event => {
        const card = event.target.closest('.flip-card');
        if (!card) return;

        // Do not flip if an interactive element was clicked
        if (event.target.closest('[data-action="expand-image"]') || event.target.closest('a')) {
            return;
        }

        // Otherwise, just toggle the class
        card.classList.toggle('is-flipped');
        card.setAttribute('aria-pressed', card.classList.contains('is-flipped'));
    });

    // Keyboard interaction
    newsGrid.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            const card = event.target.closest('.flip-card');
            if (card) {
                event.preventDefault();
                card.classList.toggle('is-flipped');
                card.setAttribute('aria-pressed', card.classList.contains('is-flipped'));
            }
        }
    });
}


function initImageLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="" alt="Expanded view" class="lightbox-image">
            <button class="lightbox-close" aria-label="Close image viewer">×</button>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCloseBtn = lightbox.querySelector('.lightbox-close');

    const openLightbox = (imgSrc) => {
        lightboxImage.src = imgSrc;
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-open');
    };

    // Event delegation for opening the lightbox
    document.body.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-action="expand-image"]');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation(); // Stop the event from bubbling up to the flip card
            
            const imgSrc = trigger.dataset.imgSrc || trigger.src;
            if (imgSrc) {
                openLightbox(imgSrc);
            }
        }
    });

    // Listeners for closing the lightbox
    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}


export { initFaqAccordion, initHeaderManager, initFlipCards, initImageLightbox };