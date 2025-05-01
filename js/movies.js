/**
 * JustStream - Movies Page Script
 * Handles movies page functionality
 */

// Page state
const state = {
    currentPage: 1,
    totalPages: 0,
    sortBy: 'popularity.desc',
    genreId: null
};

// Function to initialize the movies page
const initMoviesPage = async () => {
    try {
        // Get URL parameters
        const params = uiService.getUrlParams();
        
        // Set genre filter if provided
        if (params.genre) {
            state.genreId = params.genre;
            
            // Update page title with genre name
            try {
                const genresData = await apiService.getMovieGenres();
                const genre = genresData.genres.find(g => g.id == params.genre);
                
                if (genre) {
                    document.querySelector('.page-header h1').textContent = `${genre.name} Movies`;
                    uiService.setPageTitle(`${genre.name} Movies`);
                }
            } catch (error) {
                console.error('Error fetching genre name:', error);
            }
        }
        
        // Set up genre filter
        await setupGenreFilter();
        
        // Set up sort filter
        setupSortFilter();
        
        // Load movies
        await loadMovies();
        
        // Set up load more button
        setupLoadMore();
        
    } catch (error) {
        console.error('Error initializing movies page:', error);
    }
};

/**
 * Set up genre filter dropdown
 */
const setupGenreFilter = async () => {
    try {
        const genreFilter = document.getElementById('genre-filter');
        
        if (genreFilter) {
            // Fetch all movie genres
            const genresData = await apiService.getMovieGenres();
            
            // Add genre options to dropdown
            genresData.genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreFilter.appendChild(option);
            });
            
            // Set initial value from state if genre was specified
            if (state.genreId) {
                genreFilter.value = state.genreId;
            }
            
            // Add change event listener
            genreFilter.addEventListener('change', async () => {
                state.genreId = genreFilter.value || null;
                state.currentPage = 1;
                
                // Update page title based on genre
                if (state.genreId) {
                    const genre = genresData.genres.find(g => g.id == state.genreId);
                    if (genre) {
                        document.querySelector('.page-header h1').textContent = `${genre.name} Movies`;
                        uiService.setPageTitle(`${genre.name} Movies`);
                    }
                } else {
                    document.querySelector('.page-header h1').textContent = 'Movies';
                    uiService.setPageTitle('Movies - JustStream');
                }
                
                // Reset and reload movies
                const moviesGrid = document.getElementById('movies-grid');
                moviesGrid.innerHTML = '';
                
                await loadMovies();
            });
        }
    } catch (error) {
        console.error('Error setting up genre filter:', error);
    }
};

/**
 * Set up sort filter dropdown
 */
const setupSortFilter = () => {
    const sortFilter = document.getElementById('sort-filter');
    
    if (sortFilter) {
        // Set initial value from state
        sortFilter.value = state.sortBy;
        
        // Add change event listener
        sortFilter.addEventListener('change', async () => {
            state.sortBy = sortFilter.value;
            state.currentPage = 1;
            
            // Reset and reload movies
            const moviesGrid = document.getElementById('movies-grid');
            moviesGrid.innerHTML = '';
            
            await loadMovies();
        });
    }
};

/**
 * Load movies based on current state
 */
const loadMovies = async () => {
    try {
        const container = document.getElementById('movies-grid');
        const loadMoreButton = document.getElementById('load-more');
        
        // Show loading if it's the first page
        if (state.currentPage === 1) {
            uiService.showLoading(container);
        }
        
        // Fetch movies based on filters
        let moviesData;
        
        if (state.genreId) {
            // Fetch movies by genre
            moviesData = await apiService.discoverMoviesByGenre(
                state.genreId,
                state.sortBy,
                state.currentPage
            );
        } else {
            // Fetch movies based on sort option
            if (state.sortBy === 'popularity.desc') {
                moviesData = await apiService.getPopularMovies(state.currentPage);
            } else if (state.sortBy === 'vote_average.desc') {
                moviesData = await apiService.getTopRatedMovies(state.currentPage);
            } else {
                // Use discover for other sort options
                moviesData = await apiService.fetchFromTMDB('/discover/movie', {
                    sort_by: state.sortBy,
                    page: state.currentPage
                });
            }
        }
        
        // Update total pages
        state.totalPages = moviesData.total_pages;
        
        // Clear container if it's the first page
        if (state.currentPage === 1) {
            container.innerHTML = '';
        }
        
        // Display movies
        moviesData.results.forEach(movie => {
            const card = uiService.createMediaCard(movie);
            container.appendChild(card);
        });
        
        // Show/hide load more button
        if (state.currentPage >= state.totalPages) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading movies:', error);
        const container = document.getElementById('movies-grid');
        
        if (state.currentPage === 1) {
            uiService.showError(container);
        }
    }
};

/**
 * Set up load more button
 */
const setupLoadMore = () => {
    const loadMoreButton = document.getElementById('load-more');
    
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', async () => {
            state.currentPage++;
            await loadMovies();
        });
    }
};

// Initialize the movies page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initMoviesPage); 