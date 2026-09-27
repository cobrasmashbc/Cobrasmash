// assets/js/modules/navigation.js

function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    const navLinks = document.querySelectorAll('#main-nav a');
    const menuIcon = menuToggle.querySelector('i');

    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', () => {
        const isExpanded = mainNav.classList.toggle('nav-active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        menuIcon.classList.toggle('fa-bars', !isExpanded);
        menuIcon.classList.toggle('fa-xmark', isExpanded);
        
        document.body.classList.toggle('mobile-menu-open', isExpanded);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('nav-active')) {
                mainNav.classList.remove('nav-active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuIcon.classList.add('fa-bars');
                menuIcon.classList.remove('fa-xmark');
                
                document.body.classList.remove('mobile-menu-open');
            }
        });
    });
}

function handleNavClick(event) {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    event.preventDefault();
    const targetId = anchor.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 100;
        const targetPosition = targetElement.offsetTop - headerHeight - 15;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        if (history.pushState) {
            history.pushState(null, null, targetId);
        } else {
            window.location.hash = targetId;
        }
    }
}

function initSmoothScroll() {
    // FIX: Updated selector to match the new nav structure
    const allNavLinks = document.querySelectorAll('#main-nav a[href^="#"], footer a[href^="#"]');
    allNavLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

function initNavHighlighter() {
    const navLinks = document.querySelectorAll('#main-nav ul li a'); 
    const sections = Array.from(navLinks).map(link => {
        const href = link.getAttribute('href');
        return href && href.startsWith('#') ? document.querySelector(href) : null;
    }).filter(Boolean);

    if (sections.length === 0) return;

    const onScroll = () => {
        const headerHeight = document.querySelector('header')?.offsetHeight || 100;
        const scrollThreshold = window.pageYOffset + headerHeight + 50;
        let currentSectionId = '';
        
        sections.forEach(section => {
            if (section.offsetTop <= scrollThreshold) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        if (window.pageYOffset < sections[0].offsetTop - headerHeight) {
            currentSectionId = '';
        }

        navLinks.forEach(link => {
            const linkHrefId = link.getAttribute('href').substring(1);
            link.classList.toggle('active', linkHrefId === currentSectionId);
        });
    };

    window.addEventListener('scroll', onScroll);
    onScroll();
}

export { initMobileNav, initSmoothScroll, initNavHighlighter };