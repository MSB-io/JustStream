/**
 * JustStream UI Utilities
 * Common UI functions used across the application
 */

class UIService {
    constructor() {
        // Initialize mobile menu toggle
        this.initMobileMenu();
        
        // Initialize search functionality
        this.initSearch();
    }

    /**
     * Creates a media card element
     * @param {Object} media - Media object with title, poster_path, etc.
     * @returns {HTMLElement} - Media card element
     */
    createMediaCard(media) {
        // Determine media type, title, and release date based on media type
        const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');
        const title = media.title || media.name || 'Unknown Title';
        const releaseDate = media.release_date || media.first_air_date || '';
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
        const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
        const posterPath = media.poster_path;
        const id = media.id;

        // Create card element
        const card = document.createElement('div');
        card.className = 'media-card';
        card.dataset.id = id;
        card.dataset.type = mediaType;
        
        // Add click event to navigate to details page
        card.addEventListener('click', () => {
            window.location.href = getDetailsUrl(mediaType, id);
        });

        // Set card content with poster, title, year, and rating
        card.innerHTML = `
            <div class="media-poster">
                <img src="${getPosterUrl(posterPath)}" alt="${title}" loading="lazy">
            </div>
            <div class="media-info">
                <div class="media-title">${title}</div>
                <div class="media-meta">
                    <span class="media-year">${year}</span>
                    <span class="media-rating">${rating}</span>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Creates a cast card element
     * @param {Object} person - Cast member object
     * @returns {HTMLElement} - Cast card element
     */
    createCastCard(person) {
        const card = document.createElement('div');
        card.className = 'cast-card';
        
        card.innerHTML = `
            <div class="cast-photo">
                <img src="${getProfileUrl(person.profile_path)}" alt="${person.name}" loading="lazy">
            </div>
            <div class="cast-name">${person.name}</div>
            <div class="cast-character">${person.character || ''}</div>
        `;

        return card;
    }

    /**
     * Creates an episode item element
     * @param {Object} episode - Episode object
     * @param {number} tvId - TV show ID
     * @param {number} seasonNumber - Season number
     * @returns {HTMLElement} - Episode item element
     */
    createEpisodeItem(episode, tvId, seasonNumber) {
        const item = document.createElement('div');
        item.className = 'episode-item';
        item.dataset.episodeNumber = episode.episode_number;
        
        item.innerHTML = `
            <div class="episode-thumbnail">
                <img src="${getImageUrl(episode.still_path, 'w300')}" alt="Episode ${episode.episode_number}" loading="lazy">
            </div>
            <div class="episode-info">
                <div class="episode-number">Episode ${episode.episode_number}</div>
                <div class="episode-title">${episode.name}</div>
                <div class="episode-overview">${episode.overview || 'No overview available.'}</div>
            </div>
        `;

        // Add click event to play the episode
        item.addEventListener('click', () => {
            const playerContainer = document.getElementById('player-container');
            const iframe = document.createElement('iframe');
            
            iframe.src = `${CONFIG.vidsrc.baseUrl}/tv/${tvId}/${seasonNumber}/${episode.episode_number}`;
            iframe.allowFullscreen = true;
            
            playerContainer.innerHTML = '';
            playerContainer.appendChild(iframe);
            
            // Scroll to player
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        return item;
    }

    /**
     * Shows a loading indicator
     * @param {HTMLElement} container - Container element to show loading in
     */
    showLoading(container) {
        container.innerHTML = '<div class="loading">Loading...</div>';
    }

    /**
     * Shows an error message
     * @param {HTMLElement} container - Container element to show error in
     * @param {string} message - Error message
     */
    showError(container, message = 'Something went wrong. Please try again.') {
        container.innerHTML = `<div class="error">${message}</div>`;
    }

    /**
     * Extracts URL parameters
     * @returns {Object} - URL parameters
     */
    getUrlParams() {
        const params = {};
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        
        return params;
    }

    /**
     * Initialize mobile menu toggle
     */
    initMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu');
        const navMenu = document.querySelector('.nav-menu');
        const body = document.body;
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                body.classList.toggle('menu-open'); // Add/remove class for when menu is open
            });

            // Close menu when clicking outside
            document.addEventListener('click', (event) => {
                if (!navMenu.contains(event.target) && !menuToggle.contains(event.target) && navMenu.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            });
        }
    }

    /**
     * Initialize search functionality
     */
    initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        if (searchInput && searchButton) {
            // Search on button click
            searchButton.addEventListener('click', () => {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = getSearchUrl(query);
                }
            });
            
            // Search on Enter key
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        window.location.href = getSearchUrl(query);
                    }
                }
            });
        }
    }

    /**
     * Format runtime to hours and minutes
     * @param {number} minutes - Runtime in minutes
     * @returns {string} - Formatted runtime
     */
    formatRuntime(minutes) {
        if (!minutes) return 'N/A';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) {
            return `${mins}m`;
        }
        
        return `${hours}h ${mins}m`;
    }

    /**
     * Format date to locale format
     * @param {string} dateString - Date string (YYYY-MM-DD)
     * @returns {string} - Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Set document title
     * @param {string} title - Page title
     */
    setPageTitle(title) {
        document.title = `${title} - JustStream`;
    }
}

// Create a global instance of the UIService
const uiService = new UIService();
 