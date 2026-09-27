// assets/js/main.js

// Import initialization functions from all modules
import { initMobileNav, initSmoothScroll, initNavHighlighter } from './modules/navigation.js';
import { initHeroSlider } from './modules/heroSlider.js';
import { loadPlayers, loadTestimonials, loadNews } from './modules/contentLoader.js';
import { initFaqAccordion, initHeaderManager, initFlipCards, initImageLightbox } from './modules/uiHelpers.js';
import { initMarquee } from './modules/marquee.js'; // Import the new marquee module

// Set the current year in the footer
function setFooterYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Main initialization function to run when the DOM is ready
async function initializeApp() {
    try {
        // Initialize static UI components first
        setFooterYear();
        initHeaderManager();
        initMobileNav();
        initSmoothScroll();
        initNavHighlighter();
        initFaqAccordion();
        initImageLightbox();
        
        // Load all dynamic content from data files
        await Promise.all([
            loadNews(),
            initHeroSlider(),
            loadPlayers(),
            loadTestimonials()
        ]);
        
        // Initialize components that depend on dynamically loaded content
        initFlipCards(); 
        initMarquee(); // Initialize the JS-driven marquee
        
    } catch (error) {
        console.error("A critical error occurred during app initialization:", error);
        // Optionally, display a message to the user on the page
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: sans-serif; color: #b91c1c;"><h1>An Error Occurred</h1><p>The page could not be loaded correctly. Please try again later.</p></div>' + body.innerHTML;
        }
    }
}

// Since we are using `defer` in the script tag, the DOM is guaranteed to be ready.
initializeApp();