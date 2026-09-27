// assets/js/modules/contentLoader.js

function createPlayerCard(player) {
    const iconClass = player.iconClass || 'fas fa-user';
    const altText = `Photo of ${player.name}, member of Cobra Smash Badminton Club`;
    const imagePath = player.image ? `assets/images/players/${player.image}` : null;
    const picContentHtml = imagePath ? `<img src="${imagePath}" alt="${altText}" class="player-image-actual">` : `<i class="${iconClass}"></i>`;
    return `<div class="card member-card"><div class="profile-pic-container">${picContentHtml}</div><div class="member-name">${player.name}</div><div class="member-role">${player.role || ''}</div><p class="member-detail">${player.detail || ''}</p></div>`;
}

async function loadPlayers() {
    const adminCardGrid = document.getElementById('admin-card-grid');
    const memberCardGrid = document.getElementById('member-card-grid');
    if (!adminCardGrid || !memberCardGrid) return;
    try {
        const response = await fetch('data/players.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const playersData = await response.json();
        if (playersData.admins) {
            adminCardGrid.innerHTML = playersData.admins.map(createPlayerCard).join('');
        }
        if (playersData.members) {
            memberCardGrid.innerHTML = playersData.members.map(createPlayerCard).join('');
        }
    } catch (error) {
        console.error("Could not load player data:", error);
        const teamSection = document.getElementById('team');
        if (teamSection) teamSection.innerHTML += '<p style="color: red; text-align: center;">Error loading team information.</p>';
    }
}

function createTestimonialCard(testimonial) {
    let dateHtml = '';
    if (testimonial.date) {
        // --- THE CORRECT FIX for "Month Day, Year" format ---
        const date = new Date(testimonial.date);
        
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        dateHtml = `<p class="testimonial-date">${formattedDate}</p>`;
    }

    return `
    <div class="testimonial-card">
        <p class="quote">"${testimonial.quote}"</p>
        <div class="testimonial-footer">
            ${dateHtml}
            <div>
                <p class="name">${testimonial.name}</p>
                <p class="role">${testimonial.role || 'Member'}</p>
            </div>
        </div>
    </div>`;
}

async function loadTestimonials() {
    const marqueeContainer = document.getElementById('marquee-content-container');
    const testimonialsSection = document.getElementById('testimonials');
    if (!marqueeContainer || !testimonialsSection) return;
    try {
        const response = await fetch('data/testimonials-latest.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.testimonials && data.testimonials.length > 0) {
            const contentHtml = data.testimonials.map(createTestimonialCard).join('');
            marqueeContainer.innerHTML = contentHtml + contentHtml;
        } else {
            testimonialsSection.style.display = 'none';
        }
    } catch (error) {
        console.warn(`Could not load testimonials:`, error);
        testimonialsSection.style.display = 'none';
    }
}

function createNewsCard(article) {
    const expandIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px"><path d="M15 3h6v6h-2V5h-4V3zM9 21H3v-6h2v4h4v2zm6-18v2h4v4h2V3h-6zM3 9V3h6v2H5v4H3z"></path></svg>`;
    
    // --- THE FIX: Logic to decide which image to expand ---
    // Prioritize detailImage, but fall back to the main image.
    const imageToExpand = article.detailImage || article.image;
    
    // Always create the expand button if an image exists to expand.
    const expandButtonHtml = imageToExpand ? `<button class="card-expand-btn" data-action="expand-image" data-img-src="${imageToExpand}" aria-label="Expand image">${expandIconSvg}</button>` : '';

    // The back image only shows if a specific detailImage is provided.
    const backImageHtml = article.detailImage ? `<div class="back-image-container"><img src="${article.detailImage}" alt="${article.title} details" class="back-image" data-action="expand-image"></div>` : '';
    
    let dateBadgeHtml = '';
    let formattedBackDate = '';

    if (article.date) {
        const date = new Date(article.date);
        const day = date.getDate();
        const monthShort = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        dateBadgeHtml = `<div class="card-date-badge"><span class="day">${day}</span><span class="month">${monthShort}</span></div>`;
        formattedBackDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    return `
    <div class="flip-card" data-news-id="${article.id}" tabindex="0" role="button" aria-pressed="false">
        <div class="flip-card-inner">
            <div class="flip-card-front" style="background-image: url('${article.image}')">
                ${dateBadgeHtml}
                <div class="front-content">
                    <h3>${article.title}</h3>
                    <p class="card-hint"><i class="fas fa-sync-alt"></i> Click for Info</p>
                    ${expandButtonHtml}
                </div>
            </div>
            <div class="flip-card-back" data-flip-card-back>
                ${backImageHtml}
                <div class="back-content-container">
                    <h4>${article.title}</h4>
                    <span class="news-date">${formattedBackDate}</span>
                    <div class="description-content">${article.description}</div>
                </div>
            </div>
        </div>
    </div>`;
}

async function loadNews() {
    const newsSection = document.getElementById('latest-buzz');
    if (!newsSection) return;
    const newsGrid = newsSection.querySelector('#news-card-grid');
    if (!newsGrid) return;
    try {
        const response = await fetch('data/news.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newsData = await response.json();
        const articles = newsData.articles || [];
        if (articles.length === 0) {
            newsSection.style.display = 'none';
            return;
        }
        const DISPLAY_LIMIT = 6;
        newsGrid.innerHTML = articles.slice(0, DISPLAY_LIMIT).map(createNewsCard).join('');
        if (articles.length > DISPLAY_LIMIT) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'show-more-container';
            const showMoreBtn = document.createElement('button');
            showMoreBtn.textContent = 'Show More News';
            showMoreBtn.className = 'btn btn-secondary';
            buttonContainer.appendChild(showMoreBtn);
            newsGrid.after(buttonContainer);
            showMoreBtn.addEventListener('click', () => {
                const isShowingAll = newsGrid.children.length > DISPLAY_LIMIT;
                if (isShowingAll) {
                    newsGrid.innerHTML = articles.slice(0, DISPLAY_LIMIT).map(createNewsCard).join('');
                    showMoreBtn.textContent = 'Show More News';
                    newsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    newsGrid.innerHTML = articles.map(createNewsCard).join('');
                    showMoreBtn.textContent = 'Show Less';
                }
            });
        }
    } catch (error) {
        console.error("Could not load news data:", error);
        newsSection.style.display = 'none';
    }
}

export { loadPlayers, loadTestimonials, loadNews };