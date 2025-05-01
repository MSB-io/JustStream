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

// Initialize the home page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initHomePage); 