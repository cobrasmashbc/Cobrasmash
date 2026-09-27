// assets/js/modules/heroSlider.js

let slidesData = [];
let currentIndex = 0;
let slideTimeout;
const DEFAULT_SLIDE_DURATION = 5000;

// --- LAZY LOAD HELPER FUNCTION ---
// This function loads a slide's image if it hasn't been loaded yet.
function loadSlideImage(index) {
    const slideElements = document.querySelectorAll('.slide');
    if (!slideElements[index]) return;

    const slideElement = slideElements[index];
    // Check if the image has already been loaded by looking for a class
    if (slideElement.classList.contains('image-loaded')) {
        return;
    }

    const slideData = slidesData[index];
    if (slideData && slideData.backgroundImage) {
        slideElement.style.backgroundImage = `url('${slideData.backgroundImage}')`;
        slideElement.classList.add('image-loaded');
    }
}

function createSlider() {
    const slidesContainer = document.querySelector('.slides-container');
    if (!slidesContainer) return;

    slidesContainer.innerHTML = ''; // Clear previous content

    slidesData.forEach((slide, index) => {
        const slideElement = document.createElement('div');
        slideElement.classList.add('slide');
        const slideId = slide.id || `slide-${index}`;
        slideElement.id = slideId;

        // --- LAZY LOAD IMPLEMENTATION ---
        // Only set the background image for the very first slide on initial creation.
        if (index === 0) {
            slideElement.style.backgroundImage = `url('${slide.backgroundImage}')`;
            slideElement.classList.add('image-loaded');
        }

        // --- The rest of the slide creation logic remains the same ---
        const size = slide.backgroundSize || 'cover';
        slideElement.style.backgroundSize = size;

        if (slide.imageAlignment) {
            slideElement.dataset.imageAlignment = slide.imageAlignment;
        }

        let btnHtml = '';
        if (slide.buttonText && slide.buttonLink) {
            btnHtml = `<a href="${slide.buttonLink}" class="btn slide-btn">${slide.buttonText}</a>`;
        }
        
        const expandIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px"><path d="M15 3h6v6h-2V5h-4V3zM9 21H3v-6h2v4h4v2zm6-18v2h4v4h2V3h-6zM3 9V3h6v2H5v4H3z"></path></svg>`;
        let expandButtonHtml = '';
        if (slide.expandable) {
            expandButtonHtml = `<button class="slide-expand-btn" data-action="expand-image" data-img-src="${slide.backgroundImage}" aria-label="Expand background image">${expandIconSvg}</button>`;
        }
        
        const titleHtml = slide.title ? `<h2>${slide.title}</h2>` : '';
        
        let dateBadgeHtml = '';
        if (slide.date) {
            const date = new Date(slide.date);
            const day = date.getDate();
            const monthShort = date.toLocaleString('default', { month: 'short' }).toUpperCase();
            dateBadgeHtml = `<div class="card-date-badge"><span class="day">${day}</span><span class="month">${monthShort}</span></div>`;
        }

        slideElement.innerHTML = `
            ${dateBadgeHtml}
            ${expandButtonHtml} 
            <div class="slide-content-wrapper">
                ${titleHtml}
                <p>${slide.text}</p>
                ${btnHtml}
            </div>
        `;
        
        const styleTagId = `style-for-${slideId}`;
        let existingStyleTag = document.getElementById(styleTagId);
        if (!existingStyleTag) {
            existingStyleTag = document.createElement('style');
            existingStyleTag.id = styleTagId;
            document.head.appendChild(existingStyleTag);
        }
        existingStyleTag.textContent = `#${slideId}::before { background-color: ${slide.backgroundColorOverlay || 'rgba(0,0,0,0.65)'}; }`;
        slidesContainer.appendChild(slideElement);
    });
}

function updateSliderUI() {
    const slidesContainer = document.querySelector('.slides-container');
    const sliderDots = document.querySelectorAll('.slider-dot');
    if (!slidesContainer) return;
    
    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    sliderDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
    });
}

function goToSlide(index) {
    const slideCount = slidesData.length;
    if (index >= slideCount) {
        currentIndex = 0;
    } else if (index < 0) {
        currentIndex = slideCount - 1;
    } else {
        currentIndex = index;
    }
    
    // Call the lazy load helper when navigating
    loadSlideImage(currentIndex);
    updateSliderUI();
}

function autoSlide() {
    clearTimeout(slideTimeout);
    let nextIndex = currentIndex + 1;
    
    // Load the next slide's image just before it animates into view
    loadSlideImage(nextIndex % slidesData.length);
    goToSlide(nextIndex);

    const currentDuration = slidesData[currentIndex]?.duration || DEFAULT_SLIDE_DURATION;
    if (slidesData.length > 1) {
        slideTimeout = setTimeout(autoSlide, currentDuration);
    }
}

function startSlideShow() {
    if (slidesData.length <= 1) return;
    const firstDuration = slidesData[0]?.duration || DEFAULT_SLIDE_DURATION;
    
    // Preload the second slide's image for a smooth first auto-transition
    if (slidesData.length > 1) {
        loadSlideImage(1);
    }
    slideTimeout = setTimeout(autoSlide, firstDuration);
}

function resetSlideShow() {
    clearTimeout(slideTimeout);
    startSlideShow();
}

async function initHeroSlider() {
    const heroSectionWrapper = document.querySelector('.slider-outer-container');
    const sliderDotsContainer = document.querySelector('.slider-dots');
    const prevButton = document.querySelector('.hero-slider .prev');
    const nextButton = document.querySelector('.hero-slider .next');

    if (!heroSectionWrapper) return;
    try {
        const response = await fetch('data/slider.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        slidesData = data.slides;
        
        if (slidesData && slidesData.length > 0) {
            createSlider(); // Creates slides without all images
            
            // Create dots
            sliderDotsContainer.innerHTML = '';
            slidesData.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('slider-dot');
                dot.addEventListener('click', () => { goToSlide(index); resetSlideShow(); });
                sliderDotsContainer.appendChild(dot);
            });
            updateSliderUI(); // Set initial active dot
            
            // Wire up controls
            prevButton.addEventListener('click', () => { goToSlide(currentIndex - 1); resetSlideShow(); });
            nextButton.addEventListener('click', () => { goToSlide(currentIndex + 1); resetSlideShow(); });
            
            // Hide controls if only one slide
            const displayStyle = slidesData.length <= 1 ? 'none' : 'block';
            prevButton.style.display = displayStyle;
            nextButton.style.display = displayStyle;
            sliderDotsContainer.style.display = slidesData.length <= 1 ? 'none' : 'flex';

            startSlideShow();
        } else {
            heroSectionWrapper.style.display = 'none';
        }
    } catch (error) {
        console.error("Could not load slider data:", error);
        heroSectionWrapper.style.display = 'none';
    }
}

export { initHeroSlider };