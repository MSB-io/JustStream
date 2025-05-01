/**
 * JustStream - Watch Page Script
 * Handles the video player and episode selection for movies and TV shows
 */

// Function to initialize the watch page
const initWatchPage = async () => {
    try {
        // Get URL parameters
        const params = uiService.getUrlParams();
        
        // Check if the required parameters are present
        if (!params.id || !params.type) {
            throw new Error('Missing required parameters');
        }
        
        const mediaId = params.id;
        const mediaType = params.type;
        
        // Load content based on media type
        if (mediaType === 'movie') {
            await loadMovie(mediaId);
        } else if (mediaType === 'tv') {
            await loadTVShow(mediaId);
        } else {
            throw new Error('Invalid media type');
        }
        
        // Initialize back button
        initBackButton(mediaType, mediaId);
        
    } catch (error) {
        console.error('Error initializing watch page:', error);
        document.querySelector('.watch-container').innerHTML = `
            <div class="error-container">
                <h2>Error Loading Content</h2>
                <p>${error.message || 'Something went wrong. Please try again.'}</p>
                <a href="index.html" class="btn-primary">Back to Home</a>
            </div>
        `;
    }
};

/**
 * Load movie for watching
 * @param {number} movieId - Movie ID
 */
const loadMovie = async (movieId) => {
    try {
        // Fetch movie details
        const movie = await apiService.getMovieDetails(movieId);
        
        // Update page title
        uiService.setPageTitle(`Watch ${movie.title}`);
        
        // Update watch info
        document.getElementById('watch-title').textContent = movie.title;
        document.getElementById('watch-year').textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        document.getElementById('watch-rating').textContent = movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A';
        
        // Load video player
        loadVideoPlayer('movie', movieId);
        
        // Hide episodes container for movies
        document.getElementById('episodes-container').style.display = 'none';
        
    } catch (error) {
        console.error('Error loading movie for watching:', error);
        throw error;
    }
};

/**
 * Load TV show for watching
 * @param {number} tvId - TV show ID
 */
const loadTVShow = async (tvId) => {
    try {
        // Fetch TV show details
        const tvShow = await apiService.getTVDetails(tvId);
        
        // Update page title
        uiService.setPageTitle(`Watch ${tvShow.name}`);
        
        // Update watch info
        document.getElementById('watch-title').textContent = tvShow.name;
        document.getElementById('watch-year').textContent = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'N/A';
        document.getElementById('watch-rating').textContent = tvShow.vote_average ? `${tvShow.vote_average.toFixed(1)}/10` : 'N/A';
        
        // Get season number from URL or default to first season
        const params = uiService.getUrlParams();
        const seasonNumber = params.season ? parseInt(params.season) : 1;
        const episodeNumber = params.episode ? parseInt(params.episode) : 1;
        
        // Load video player with selected episode or default to first episode
        loadVideoPlayer('tv', tvId, seasonNumber, episodeNumber);
        
        // Load seasons dropdown
        await loadSeasonsDropdown(tvId, tvShow.seasons, seasonNumber);
        
        // Load episodes list for the selected season
        await loadEpisodesList(tvId, seasonNumber, episodeNumber);
        
    } catch (error) {
        console.error('Error loading TV show for watching:', error);
        throw error;
    }
};

/**
 * Load video player
 * @param {string} mediaType - Media type ('movie' or 'tv')
 * @param {number} mediaId - Media ID
 * @param {number} seasonNumber - Season number (for TV shows)
 * @param {number} episodeNumber - Episode number (for TV shows)
 */
const loadVideoPlayer = (mediaType, mediaId, seasonNumber = null, episodeNumber = null) => {
    const playerContainer = document.getElementById('player-container');
    const iframe = document.createElement('iframe');
    
    // Set iframe attributes
    iframe.allowFullscreen = true;
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    
    // Set source URL based on media type
    if (mediaType === 'movie') {
        iframe.src = getVidSrcUrl('movie', mediaId);
    } else if (mediaType === 'tv') {
        iframe.src = `${getVidSrcUrl('tv', mediaId)}/${seasonNumber}/${episodeNumber}`;
    }
    
    // Clear container and append iframe
    playerContainer.innerHTML = '';
    playerContainer.appendChild(iframe);
};

/**
 * Load seasons dropdown
 * @param {number} tvId - TV show ID
 * @param {Array} seasons - Seasons array from TV show details
 * @param {number} selectedSeason - Currently selected season
 */
const loadSeasonsDropdown = async (tvId, seasons, selectedSeason) => {
    try {
        const seasonSelect = document.getElementById('season-select');
        
        // Clear dropdown
        seasonSelect.innerHTML = '';
        
        // Add options for each season
        seasons.forEach(season => {
            // Skip season 0 (Specials) for simplicity
            if (season.season_number > 0) {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.textContent = `Season ${season.season_number}`;
                
                // Select the current season
                if (season.season_number === selectedSeason) {
                    option.selected = true;
                }
                
                seasonSelect.appendChild(option);
            }
        });
        
        // Add change event listener
        seasonSelect.addEventListener('change', () => {
            const newSeasonNumber = parseInt(seasonSelect.value);
            
            // Update URL with new season
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('season', newSeasonNumber);
            currentUrl.searchParams.delete('episode'); // Reset episode number
            
            window.location.href = currentUrl.toString();
        });
        
    } catch (error) {
        console.error('Error loading seasons dropdown:', error);
        throw error;
    }
};

/**
 * Load episodes list for a season
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 * @param {number} selectedEpisode - Currently selected episode
 */
const loadEpisodesList = async (tvId, seasonNumber, selectedEpisode) => {
    try {
        const episodesList = document.getElementById('episodes-list');
        
        // Show loading
        uiService.showLoading(episodesList);
        
        // Fetch season details
        const seasonDetails = await apiService.getTVSeasonDetails(tvId, seasonNumber);
        
        // Clear episodes list
        episodesList.innerHTML = '';
        
        // Add episodes to the list
        seasonDetails.episodes.forEach(episode => {
            const episodeItem = uiService.createEpisodeItem(episode, tvId, seasonNumber);
            
            // Highlight selected episode
            if (episode.episode_number === selectedEpisode) {
                episodeItem.classList.add('active');
            }
            
            episodesList.appendChild(episodeItem);
        });
        
    } catch (error) {
        console.error('Error loading episodes list:', error);
        const episodesList = document.getElementById('episodes-list');
        uiService.showError(episodesList, 'Failed to load episodes.');
    }
};

/**
 * Initialize back button
 * @param {string} mediaType - Media type ('movie' or 'tv')
 * @param {number} mediaId - Media ID
 */
const initBackButton = (mediaType, mediaId) => {
    const backButton = document.getElementById('back-button');
    
    if (backButton) {
        backButton.href = getDetailsUrl(mediaType, mediaId);
    }
};

// Initialize the watch page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initWatchPage); 