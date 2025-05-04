/**
 * JustStream - Main App Script
 * Handles the homepage content and functionality
 */

// Function to initialize the home page
const initHomePage = async () => {
    try {
        // Load trending movies
        await loadTrendingMovies();
        
        // Load top rated movies
        await loadTopRatedMovies();
        
        // Load popular TV shows
        await loadPopularTVShows();
        
        // Load continue watching section
        loadContinueWatching();
        
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
};

/**
 * Load trending movies section
 */
const loadTrendingMovies = async () => {
    try {
        const container = document.getElementById('trending-movies');
        
        // Show loading indicator
        uiService.showLoading(container);
        
        // Get trending movies
        const trendingMovies = await apiService.getTrendingMovies();
        
        // Clear container
        container.innerHTML = '';
        
        // Display movies
        trendingMovies.results.forEach(movie => {
            const card = uiService.createMediaCard(movie);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading trending movies:', error);
        const container = document.getElementById('trending-movies');
        uiService.showError(container);
    }
};

/**
 * Load top rated movies section
 */
const loadTopRatedMovies = async () => {
    try {
        const container = document.getElementById('top-rated-movies');
        
        // Show loading indicator
        uiService.showLoading(container);
        
        // Get top rated movies
        const topRatedMovies = await apiService.getTopRatedMovies();
        
        // Clear container
        container.innerHTML = '';
        
        // Display movies
        topRatedMovies.results.forEach(movie => {
            const card = uiService.createMediaCard(movie);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading top rated movies:', error);
        const container = document.getElementById('top-rated-movies');
        uiService.showError(container);
    }
};

/**
 * Load popular TV shows section
 */
const loadPopularTVShows = async () => {
    try {
        const container = document.getElementById('popular-tvshows');
        
        // Show loading indicator
        uiService.showLoading(container);
        
        // Get popular TV shows
        const popularTVShows = await apiService.getPopularTVShows();
        
        // Clear container
        container.innerHTML = '';
        
        // Display TV shows
        popularTVShows.results.forEach(tvShow => {
            const card = uiService.createMediaCard(tvShow);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading popular TV shows:', error);
        const container = document.getElementById('popular-tvshows');
        uiService.showError(container);
    }
};

/**
 * Load continue watching section
 */
const loadContinueWatching = () => {
    try {
        const container = document.getElementById('continue-watching');
        const section = document.getElementById('continue-watching-section');
        const noHistoryMessage = document.getElementById('no-history-message');
        
        // Get watched history from localStorage
        const watchHistory = getWatchHistory();
        
        // Clear container
        container.innerHTML = '';
        
        // If no watch history, show message and hide section
        if (watchHistory.length === 0) {
            container.style.display = 'none';
            noHistoryMessage.style.display = 'block';
        } else {
            container.style.display = 'flex';
            noHistoryMessage.style.display = 'none';
            
            // Display watched items (most recent first)
            watchHistory.slice(0, 10).forEach(item => {
                const card = createWatchHistoryCard(item);
                container.appendChild(card);
            });
        }
        
        // Add event listener to clear history button
        const clearButton = document.getElementById('clear-history');
        clearButton.addEventListener('click', () => {
            clearWatchHistory();
            loadContinueWatching(); // Reload the section
        });
        
    } catch (error) {
        console.error('Error loading continue watching section:', error);
    }
};

/**
 * Creates a media card for watch history items
 * @param {Object} item - Watch history item
 * @returns {HTMLElement} - Media card element
 */
const createWatchHistoryCard = (item) => {
    // Create card element
    const card = document.createElement('div');
    card.className = 'media-card';
    card.dataset.id = item.id;
    card.dataset.type = item.mediaType;
    
    // Add click event to navigate to watch page directly
    card.addEventListener('click', () => {
        window.location.href = getWatchUrl(item.mediaType, item.id);
    });

    // Set card content with poster, title, year, and rating
    card.innerHTML = `
        <div class="media-poster">
            <img src="${item.posterUrl}" alt="${item.title}" loading="lazy">
            <div class="watch-progress">
                <div class="progress-bar" style="width: ${item.progress || '0%'}"></div>
            </div>
        </div>
        <div class="media-info">
            <div class="media-title">${item.title}</div>
            <div class="media-meta">
                <span class="media-year">${item.year || 'N/A'}</span>
                <span class="media-rating">${item.rating || 'N/A'}</span>
            </div>
        </div>
    `;

    return card;
};

/**
 * Get watch history from localStorage
 * @returns {Array} - Array of watched items
 */
const getWatchHistory = () => {
    const history = localStorage.getItem('watchHistory');
    return history ? JSON.parse(history) : [];
};

/**
 * Clear watch history
 */
const clearWatchHistory = () => {
    localStorage.removeItem('watchHistory');
};

// Initialize the home page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initHomePage);