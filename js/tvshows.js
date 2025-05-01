/**
 * JustStream - TV Shows Page Script
 * Handles TV shows page functionality
 */

// Page state
const state = {
    currentPage: 1,
    totalPages: 0,
    sortBy: 'popularity.desc',
    genreId: null
};

// Function to initialize the TV shows page
const initTVShowsPage = async () => {
    try {
        // Get URL parameters
        const params = uiService.getUrlParams();
        
        // Set genre filter if provided
        if (params.genre) {
            state.genreId = params.genre;
            
            // Update page title with genre name
            try {
                const genresData = await apiService.getTVGenres();
                const genre = genresData.genres.find(g => g.id == params.genre);
                
                if (genre) {
                    document.querySelector('.page-header h1').textContent = `${genre.name} TV Shows`;
                    uiService.setPageTitle(`${genre.name} TV Shows`);
                }
            } catch (error) {
                console.error('Error fetching genre name:', error);
            }
        }
        
        // Set up genre filter
        await setupGenreFilter();
        
        // Set up sort filter
        setupSortFilter();
        
        // Load TV shows
        await loadTVShows();
        
        // Set up load more button
        setupLoadMore();
        
    } catch (error) {
        console.error('Error initializing TV shows page:', error);
    }
};

/**
 * Set up genre filter dropdown
 */
const setupGenreFilter = async () => {
    try {
        const genreFilter = document.getElementById('genre-filter');
        
        if (genreFilter) {
            // Fetch all TV genres
            const genresData = await apiService.getTVGenres();
            
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
                        document.querySelector('.page-header h1').textContent = `${genre.name} TV Shows`;
                        uiService.setPageTitle(`${genre.name} TV Shows`);
                    }
                } else {
                    document.querySelector('.page-header h1').textContent = 'TV Shows';
                    uiService.setPageTitle('TV Shows - JustStream');
                }
                
                // Reset and reload TV shows
                const tvShowsGrid = document.getElementById('tvshows-grid');
                tvShowsGrid.innerHTML = '';
                
                await loadTVShows();
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
            
            // Reset and reload TV shows
            const tvShowsGrid = document.getElementById('tvshows-grid');
            tvShowsGrid.innerHTML = '';
            
            await loadTVShows();
        });
    }
};

/**
 * Load TV shows based on current state
 */
const loadTVShows = async () => {
    try {
        const container = document.getElementById('tvshows-grid');
        const loadMoreButton = document.getElementById('load-more');
        
        // Show loading if it's the first page
        if (state.currentPage === 1) {
            uiService.showLoading(container);
        }
        
        // Fetch TV shows based on filters
        let tvShowsData;
        
        if (state.genreId) {
            // Fetch TV shows by genre
            tvShowsData = await apiService.discoverTVShowsByGenre(
                state.genreId,
                state.sortBy,
                state.currentPage
            );
        } else {
            // Fetch TV shows based on sort option
            if (state.sortBy === 'popularity.desc') {
                tvShowsData = await apiService.getPopularTVShows(state.currentPage);
            } else if (state.sortBy === 'vote_average.desc') {
                tvShowsData = await apiService.getTopRatedTVShows(state.currentPage);
            } else {
                // Use discover for other sort options
                tvShowsData = await apiService.fetchFromTMDB('/discover/tv', {
                    sort_by: state.sortBy,
                    page: state.currentPage
                });
            }
        }
        
        // Update total pages
        state.totalPages = tvShowsData.total_pages;
        
        // Clear container if it's the first page
        if (state.currentPage === 1) {
            container.innerHTML = '';
        }
        
        // Display TV shows
        tvShowsData.results.forEach(tvShow => {
            const card = uiService.createMediaCard(tvShow);
            container.appendChild(card);
        });
        
        // Show/hide load more button
        if (state.currentPage >= state.totalPages) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading TV shows:', error);
        const container = document.getElementById('tvshows-grid');
        
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
            await loadTVShows();
        });
    }
};

// Initialize the TV shows page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initTVShowsPage); 