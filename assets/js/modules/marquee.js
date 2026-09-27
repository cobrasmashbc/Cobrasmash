// assets/js/modules/marquee.js

function initMarquee() {
    const marqueeContainer = document.querySelector('.marquee-container');
    if (!marqueeContainer) return;

    const marqueeContent = marqueeContainer.querySelector('.marquee-content');
    if (!marqueeContent || marqueeContent.children.length === 0) return;

    // We already duplicated the content in contentLoader.js, which is perfect.
    
    let scrollAmount = 0;
    const scrollSpeed = 0.5; // Adjust this value to make it faster or slower
    let isPaused = false;
    let animationFrameId;

    // Calculate the point at which the scroll should reset
    const resetPoint = marqueeContent.scrollWidth / 2;

    function scrollStep() {
        if (!isPaused) {
            scrollAmount += scrollSpeed;
            if (scrollAmount >= resetPoint) {
                scrollAmount = 0; // Reset to the beginning for a seamless loop
            }
            marqueeContent.style.transform = `translateX(-${scrollAmount}px)`;
        }
        animationFrameId = requestAnimationFrame(scrollStep);
    }

    // Pause animation on hover
    marqueeContainer.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    // Resume animation on mouse leave
    marqueeContainer.addEventListener('mouseleave', () => {
        isPaused = false;
    });
    
    // Also handle focus for keyboard accessibility
    marqueeContainer.addEventListener('focusin', () => {
        isPaused = true;
    });
    
    marqueeContainer.addEventListener('focusout', () => {
        isPaused = false;
    });


    // Start the animation
    animationFrameId = requestAnimationFrame(scrollStep);

    // Optional: Clean up the animation frame when the element is no longer visible
    // to save resources, though it's very efficient already.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animationFrameId = requestAnimationFrame(scrollStep);
            }
        });
    });

    observer.observe(marqueeContainer);
}

export { initMarquee };