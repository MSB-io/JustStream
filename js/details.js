/**
 * JustStream - Details Page Script
 * Handles movie and TV show details page functionality
 */

// Function to initialize the details page
const initDetailsPage = async () => {
    try {
        // Get URL parameters
        const params = uiService.getUrlParams();
        
        // Check if the required parameters are present
        if (!params.id || !params.type) {
            throw new Error('Missing required parameters');
        }
        
        const mediaId = params.id;
        const mediaType = params.type;
        
        // Load details based on media type
        if (mediaType === 'movie') {
            await loadMovieDetails(mediaId);
        } else if (mediaType === 'tv') {
            await loadTVDetails(mediaId);
        } else {
            throw new Error('Invalid media type');
        }
        
    } catch (error) {
        console.error('Error initializing details page:', error);
        document.getElementById('details-container').innerHTML = `
            <div class="error-container">
                <h2>Error Loading Content</h2>
                <p>${error.message || 'Something went wrong. Please try again.'}</p>
                <a href="index.html" class="btn-primary">Back to Home</a>
            </div>
        `;
    }
};

/**
 * Load movie details
 * @param {number} movieId - Movie ID
 */
const loadMovieDetails = async (movieId) => {
    try {
        // Fetch movie details
        const movie = await apiService.getMovieDetails(movieId);
        
        // Update page title
        uiService.setPageTitle(movie.title);
        
        // Update backdrop
        updateBackdrop(movie.backdrop_path);
        
        // Update poster
        document.getElementById('details-poster-img').src = getPosterUrl(movie.poster_path);
        document.getElementById('details-poster-img').alt = movie.title;
        
        // Update title and information
        document.getElementById('details-title').textContent = movie.title;
        document.getElementById('details-year').textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        document.getElementById('details-rating').textContent = movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A';
        document.getElementById('details-runtime').textContent = uiService.formatRuntime(movie.runtime);
        
        // Update overview
        document.getElementById('details-overview').textContent = movie.overview || 'No overview available.';
        
        // Add genres
        const genresContainer = document.getElementById('details-genres');
        genresContainer.innerHTML = '';
        
        movie.genres.forEach(genre => {
            const genreTag = document.createElement('span');
            genreTag.className = 'genre-tag';
            genreTag.textContent = genre.name;
            genresContainer.appendChild(genreTag);
        });
        
        // Set "Watch Now" button link
        document.getElementById('watch-button').href = getWatchUrl('movie', movieId);
        
        // Load cast
        await loadMovieCast(movieId);
        
        // Load similar movies
        await loadSimilarMovies(movieId);
        
        // Load trailer
        await loadMovieTrailer(movieId);
        
    } catch (error) {
        console.error('Error loading movie details:', error);
        throw error;
    }
};

/**
 * Load TV show details
 * @param {number} tvId - TV show ID
 */
const loadTVDetails = async (tvId) => {
    try {
        // Fetch TV show details
        const tvShow = await apiService.getTVDetails(tvId);
        
        // Update page title
        uiService.setPageTitle(tvShow.name);
        
        // Update backdrop
        updateBackdrop(tvShow.backdrop_path);
        
        // Update poster
        document.getElementById('details-poster-img').src = getPosterUrl(tvShow.poster_path);
        document.getElementById('details-poster-img').alt = tvShow.name;
        
        // Update title and information
        document.getElementById('details-title').textContent = tvShow.name;
        document.getElementById('details-year').textContent = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'N/A';
        document.getElementById('details-rating').textContent = tvShow.vote_average ? `${tvShow.vote_average.toFixed(1)}/10` : 'N/A';
        document.getElementById('details-runtime').textContent = tvShow.number_of_seasons ? `${tvShow.number_of_seasons} Season${tvShow.number_of_seasons > 1 ? 's' : ''}` : 'N/A';
        
        // Update overview
        document.getElementById('details-overview').textContent = tvShow.overview || 'No overview available.';
        
        // Add genres
        const genresContainer = document.getElementById('details-genres');
        genresContainer.innerHTML = '';
        
        tvShow.genres.forEach(genre => {
            const genreTag = document.createElement('span');
            genreTag.className = 'genre-tag';
            genreTag.textContent = genre.name;
            genresContainer.appendChild(genreTag);
        });
        
        // Set "Watch Now" button link
        document.getElementById('watch-button').href = getWatchUrl('tv', tvId);
        
        // Load cast
        await loadTVCast(tvId);
        
        // Load similar TV shows
        await loadSimilarTVShows(tvId);
        
        // Load trailer
        await loadTVTrailer(tvId);
        
    } catch (error) {
        console.error('Error loading TV show details:', error);
        throw error;
    }
};

/**
 * Update backdrop image
 * @param {string} backdropPath - Backdrop image path
 */
const updateBackdrop = (backdropPath) => {
    if (backdropPath) {
        document.getElementById('backdrop').style.backgroundImage = `url(${getBackdropUrl(backdropPath)})`;
    }
};

/**
 * Load movie cast
 * @param {number} movieId - Movie ID
 */
const loadMovieCast = async (movieId) => {
    try {
        const castContainer = document.getElementById('cast-container');
        
        // Show loading
        uiService.showLoading(castContainer);
        
        // Fetch movie credits
        const credits = await apiService.getMovieCredits(movieId);
        
        // Clear container
        castContainer.innerHTML = '';
        
        // Display the first 10 cast members
        credits.cast.slice(0, 10).forEach(person => {
            const castCard = uiService.createCastCard(person);
            castContainer.appendChild(castCard);
        });
        
    } catch (error) {
        console.error('Error loading movie cast:', error);
        const castContainer = document.getElementById('cast-container');
        uiService.showError(castContainer, 'Failed to load cast information.');
    }
};

/**
 * Load TV cast
 * @param {number} tvId - TV show ID
 */
const loadTVCast = async (tvId) => {
    try {
        const castContainer = document.getElementById('cast-container');
        
        // Show loading
        uiService.showLoading(castContainer);
        
        // Fetch TV credits
        const credits = await apiService.getTVCredits(tvId);
        
        // Clear container
        castContainer.innerHTML = '';
        
        // Display the first 10 cast members
        credits.cast.slice(0, 10).forEach(person => {
            const castCard = uiService.createCastCard(person);
            castContainer.appendChild(castCard);
        });
        
    } catch (error) {
        console.error('Error loading TV cast:', error);
        const castContainer = document.getElementById('cast-container');
        uiService.showError(castContainer, 'Failed to load cast information.');
    }
};

/**
 * Load similar movies
 * @param {number} movieId - Movie ID
 */
const loadSimilarMovies = async (movieId) => {
    try {
        const similarContainer = document.getElementById('similar-content');
        
        // Show loading
        uiService.showLoading(similarContainer);
        
        // Fetch similar movies
        const similarMovies = await apiService.getSimilarMovies(movieId);
        
        // Clear container
        similarContainer.innerHTML = '';
        
        // Check if there are any similar movies
        if (similarMovies.results.length === 0) {
            similarContainer.innerHTML = '<p>No similar movies found.</p>';
            return;
        }
        
        // Display the first 10 similar movies
        similarMovies.results.slice(0, 10).forEach(movie => {
            const card = uiService.createMediaCard(movie);
            similarContainer.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading similar movies:', error);
        const similarContainer = document.getElementById('similar-content');
        uiService.showError(similarContainer, 'Failed to load similar movies.');
    }
};

/**
 * Load similar TV shows
 * @param {number} tvId - TV show ID
 */
const loadSimilarTVShows = async (tvId) => {
    try {
        const similarContainer = document.getElementById('similar-content');
        
        // Show loading
        uiService.showLoading(similarContainer);
        
        // Fetch similar TV shows
        const similarTVShows = await apiService.getSimilarTVShows(tvId);
        
        // Clear container
        similarContainer.innerHTML = '';
        
        // Check if there are any similar TV shows
        if (similarTVShows.results.length === 0) {
            similarContainer.innerHTML = '<p>No similar TV shows found.</p>';
            return;
        }
        
        // Display the first 10 similar TV shows
        similarTVShows.results.slice(0, 10).forEach(tvShow => {
            const card = uiService.createMediaCard(tvShow);
            similarContainer.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading similar TV shows:', error);
        const similarContainer = document.getElementById('similar-content');
        uiService.showError(similarContainer, 'Failed to load similar TV shows.');
    }
};

/**
 * Load movie trailer
 * @param {number} movieId - Movie ID
 */
const loadMovieTrailer = async (movieId) => {
    try {
        // Fetch movie videos
        const videos = await apiService.getMovieVideos(movieId);
        
        // Find the trailer
        const trailer = videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        
        if (trailer) {
            setupTrailerModal(trailer.key);
        } else {
            // Hide trailer button if no trailer is available
            document.getElementById('trailer-button').style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading movie trailer:', error);
        // Hide trailer button on error
        document.getElementById('trailer-button').style.display = 'none';
    }
};

/**
 * Load TV trailer
 * @param {number} tvId - TV show ID
 */
const loadTVTrailer = async (tvId) => {
    try {
        // Fetch TV videos
        const videos = await apiService.getTVVideos(tvId);
        
        // Find the trailer
        const trailer = videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        
        if (trailer) {
            setupTrailerModal(trailer.key);
        } else {
            // Hide trailer button if no trailer is available
            document.getElementById('trailer-button').style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading TV trailer:', error);
        // Hide trailer button on error
        document.getElementById('trailer-button').style.display = 'none';
    }
};

/**
 * Set up trailer modal
 * @param {string} videoKey - YouTube video key
 */
const setupTrailerModal = (videoKey) => {
    // Get elements
    const trailerButton = document.getElementById('trailer-button');
    const trailerModal = document.getElementById('trailer-modal');
    const trailerContainer = document.getElementById('trailer-container');
    const closeModal = document.querySelector('.close-modal');
    
    // Set up the trailer button
    trailerButton.addEventListener('click', (event) => {
        event.preventDefault();
        
        // Create iframe for YouTube video
        trailerContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoKey}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
        
        // Show modal
        trailerModal.style.display = 'flex';
    });
    
    // Close the modal when clicking the close button
    closeModal.addEventListener('click', () => {
        trailerModal.style.display = 'none';
        trailerContainer.innerHTML = '';
    });
    
    // Close the modal when clicking outside the modal content
    trailerModal.addEventListener('click', (event) => {
        if (event.target === trailerModal) {
            trailerModal.style.display = 'none';
            trailerContainer.innerHTML = '';
        }
    });
};

// Initialize the details page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDetailsPage); 