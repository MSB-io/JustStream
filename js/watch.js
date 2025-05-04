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
        
        // Store movie details globally for later use
        window.currentMovie = movie;
        
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
        
        // Store TV show details globally for later use
        window.currentTVShow = tvShow;
        
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
    
    // Create source selector
    const sourceSelector = document.createElement('div');
    sourceSelector.className = 'source-selector';
    sourceSelector.innerHTML = `
        <div class="source-selector-inner">
            <span>Source:</span>
            <select id="video-source">
                <option value="vip" selected>VIP Player</option>
                <option value="multiembed">Multiembed</option>
                <option value="vidsrc">VidSrc</option>
            </select>
        </div>
    `;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    
    // Set iframe attributes
    iframe.allowFullscreen = true;
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    
    // Set initial source URL to VIP player (now the default)
    let url = `${CONFIG.multiembed.baseUrl}?video_id=${mediaId}`;
    
    // Add tmdb parameter if using TMDB ID (default in our app)
    url += '&tmdb=1';
    
    // Add season and episode for TV shows
    if (mediaType === 'tv' && seasonNumber && episodeNumber) {
        url += `&s=${seasonNumber}&e=${episodeNumber}`;
    }
    
    iframe.src = url;
    
    // Clear container and append elements
    playerContainer.innerHTML = '';
    playerContainer.appendChild(sourceSelector);
    playerContainer.appendChild(iframe);
    
    // Add event listener to source selector
    document.getElementById('video-source').addEventListener('change', (e) => {
        const source = e.target.value;
        
        if (source === 'vidsrc') {
            if (mediaType === 'movie') {
                iframe.src = getVidSrcUrl('movie', mediaId);
            } else if (mediaType === 'tv') {
                iframe.src = `${getVidSrcUrl('tv', mediaId)}/${seasonNumber}/${episodeNumber}`;
            }
        } else if (source === 'multiembed') {
            iframe.src = getMultiembedUrl(mediaType, mediaId, seasonNumber, episodeNumber);
        } else if (source === 'vip') {
            // Use VIP player option (without tmdb=1 for IMDB IDs)
            let url = `${CONFIG.multiembed.baseUrl}?video_id=${mediaId}`;
            
            // Add tmdb parameter if using TMDB ID (default in our app)
            url += '&tmdb=1';
            
            // Add season and episode for TV shows
            if (mediaType === 'tv' && seasonNumber && episodeNumber) {
                url += `&s=${seasonNumber}&e=${episodeNumber}`;
            }
            
            iframe.src = url;
        }
    });
    
    // Add to watch history when video loads
    setTimeout(() => {
        // Get the current media data
        let mediaData;
        if (mediaType === 'movie') {
            // For movies
            const title = document.getElementById('watch-title').textContent;
            const year = document.getElementById('watch-year').textContent;
            const rating = document.getElementById('watch-rating').textContent.split('/')[0];
            
            // Get poster path from the global movie object
            // This assumes loadMovie function has stored the movie details
            const posterPath = window.currentMovie ? window.currentMovie.poster_path : null;
            
            mediaData = {
                id: mediaId,
                mediaType: mediaType,
                title: title,
                poster_path: posterPath,
                year: year,
                rating: rating,
                progress: '10%' // Default progress
            };
        } else {
            // For TV shows
            const title = document.getElementById('watch-title').textContent;
            const year = document.getElementById('watch-year').textContent;
            const rating = document.getElementById('watch-rating').textContent.split('/')[0];
            
            // Get poster path from the global tvShow object
            // This assumes loadTVShow function has stored the TV show details
            const posterPath = window.currentTVShow ? window.currentTVShow.poster_path : null;
            
            mediaData = {
                id: mediaId,
                mediaType: mediaType,
                title: `${title} S${seasonNumber}E${episodeNumber}`,
                poster_path: posterPath,
                year: year,
                rating: rating,
                progress: '10%', // Default progress
                seasonNumber: seasonNumber,
                episodeNumber: episodeNumber
            };
        }
        
        // Add to watch history
        addToWatchHistory(mediaData);
        
    }, 3000); // Wait 3 seconds to ensure the video has started loading
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


// Add this function to your watch.js file

/**
 * Add item to watch history
 * @param {Object} mediaData - Media data object
 */
const addToWatchHistory = (mediaData) => {
    // Get current watch history
    const history = localStorage.getItem('watchHistory');
    let watchHistory = history ? JSON.parse(history) : [];
    
    // Check if item already exists in history
    const existingIndex = watchHistory.findIndex(item => 
        item.id === mediaData.id && item.mediaType === mediaData.mediaType
    );
    
    // If it's a TV show with episode info, check for the specific episode
    if (mediaData.mediaType === 'tv' && mediaData.seasonNumber && mediaData.episodeNumber) {
        const existingEpisodeIndex = watchHistory.findIndex(item => 
            item.id === mediaData.id && 
            item.mediaType === mediaData.mediaType &&
            item.seasonNumber === mediaData.seasonNumber &&
            item.episodeNumber === mediaData.episodeNumber
        );
        
        if (existingEpisodeIndex !== -1) {
            watchHistory.splice(existingEpisodeIndex, 1);
        }
    } else if (existingIndex !== -1) {
        watchHistory.splice(existingIndex, 1);
    }
    
    // Create history item
    const historyItem = {
        id: mediaData.id,
        mediaType: mediaData.mediaType,
        title: mediaData.title,
        posterUrl: mediaData.poster_path ? 
            `https://image.tmdb.org/t/p/w500${mediaData.poster_path}` : 
            'https://via.placeholder.com/300x450?text=No+Image',
        year: mediaData.year,
        rating: mediaData.rating,
        progress: mediaData.progress || '10%',
        timestamp: Date.now()
    };
    
    // Add season and episode info for TV shows
    if (mediaData.mediaType === 'tv' && mediaData.seasonNumber && mediaData.episodeNumber) {
        historyItem.seasonNumber = mediaData.seasonNumber;
        historyItem.episodeNumber = mediaData.episodeNumber;
    }
    
    // Add to beginning of array (most recent first)
    watchHistory.unshift(historyItem);
    
    // Limit history to 20 items
    if (watchHistory.length > 20) {
        watchHistory = watchHistory.slice(0, 20);
    }
    
    // Save to localStorage
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
    
    console.log('Added to watch history:', historyItem);
};

// Call this function when the video starts playing
// For example, add this to your initPlayer function