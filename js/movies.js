/**
 * JustStream - Movies Page Script
 * Handles movies page functionality
 */

// Page state
const state = {
    currentPage: 1,
    totalPages: 0,
    sortBy: 'popularity.desc',
    genreId: null,
    year: null,
    language: null,
    minRating: null
};

// Function to initialize the movies page
const initMoviesPage = async () => {
    try {
        // Get URL parameters
        const params = uiService.getUrlParams();
        
        // Set genre filter if provided
        if (params.genre) {
            state.genreId = params.genre;
        }
        
        // Set year filter if provided
        if (params.year) {
            state.year = params.year;
        }
        
        // Set language filter if provided
        if (params.language) {
            state.language = params.language;
        }
        
        // Set rating filter if provided
        if (params.rating) {
            state.minRating = params.rating;
        }
        
        // Update page title with filters if any are applied
        updatePageTitle();
        
        // Set up filter dropdowns
        await setupGenreFilter();
        await setupYearFilter();
        await setupLanguageFilter();
        setupRatingFilter();
        setupSortFilter();
        setupResetButton();
        
        // Load movies
        await loadMovies();
        
        // Set up load more button
        setupLoadMore();
        
    } catch (error) {
        console.error('Error initializing movies page:', error);
    }
};

/**
 * Update page title based on active filters
 */
const updatePageTitle = async () => {
    let title = 'Movies';
    
    try {
        // Add genre name to title if applicable
        if (state.genreId) {
            const genresData = await apiService.getMovieGenres();
            const genre = genresData.genres.find(g => g.id == state.genreId);
            
            if (genre) {
                title = `${genre.name} Movies`;
            }
        }
        
        // Add year to title if applicable
        if (state.year) {
            title += ` (${state.year})`;
        }
        
        // Update DOM and page title
        document.querySelector('.page-header h1').textContent = title;
        uiService.setPageTitle(`${title} - JustStream`);
    } catch (error) {
        console.error('Error updating page title:', error);
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
                
                // Update page title and reload movies
                await updatePageTitle();
                resetAndReloadMovies();
            });
        }
    } catch (error) {
        console.error('Error setting up genre filter:', error);
    }
};

/**
 * Set up year filter dropdown
 */
const setupYearFilter = async () => {
    try {
        const yearFilter = document.getElementById('year-filter');
        
        if (yearFilter) {
            // Add year options (current year down to 1900)
            const currentYear = new Date().getFullYear();
            for (let year = currentYear; year >= 1900; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            }
            
            // Set initial value from state if year was specified
            if (state.year) {
                yearFilter.value = state.year;
            }
            
            // Add change event listener
            yearFilter.addEventListener('change', async () => {
                state.year = yearFilter.value || null;
                state.currentPage = 1;
                
                // Update page title and reload movies
                await updatePageTitle();
                resetAndReloadMovies();
            });
        }
    } catch (error) {
        console.error('Error setting up year filter:', error);
    }
};

/**
 * Set up language filter dropdown
 */
const setupLanguageFilter = async () => {
    try {
        const languageFilter = document.getElementById('language-filter');
        
        if (languageFilter) {
            // Fetch all languages
            const languagesData = await apiService.getLanguages();
            
            // Sort languages by English name
            const sortedLanguages = languagesData.sort((a, b) => 
                a.english_name.localeCompare(b.english_name)
            );
            
            // Add language options to dropdown (most common first)
            const commonLanguages = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'hi', 'ru'];
            
            // Add common languages first
            commonLanguages.forEach(langCode => {
                const language = sortedLanguages.find(l => l.iso_639_1 === langCode);
                if (language) {
                    const option = document.createElement('option');
                    option.value = language.iso_639_1;
                    option.textContent = language.english_name;
                    languageFilter.appendChild(option);
                }
            });
            
            // Add a separator
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '──────────';
            languageFilter.appendChild(separator);
            
            // Add all other languages
            sortedLanguages.forEach(language => {
                if (!commonLanguages.includes(language.iso_639_1)) {
                    const option = document.createElement('option');
                    option.value = language.iso_639_1;
                    option.textContent = language.english_name;
                    languageFilter.appendChild(option);
                }
            });
            
            // Set initial value from state if language was specified
            if (state.language) {
                languageFilter.value = state.language;
            }
            
            // Add change event listener
            languageFilter.addEventListener('change', () => {
                state.language = languageFilter.value || null;
                state.currentPage = 1;
                resetAndReloadMovies();
            });
        }
    } catch (error) {
        console.error('Error setting up language filter:', error);
    }
};

/**
 * Set up rating filter dropdown
 */
const setupRatingFilter = () => {
    const ratingFilter = document.getElementById('rating-filter');
    
    if (ratingFilter) {
        // Set initial value from state if rating was specified
        if (state.minRating) {
            ratingFilter.value = state.minRating;
        }
        
        // Add change event listener
        ratingFilter.addEventListener('change', () => {
            state.minRating = ratingFilter.value || null;
            state.currentPage = 1;
            resetAndReloadMovies();
        });
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
        sortFilter.addEventListener('change', () => {
            state.sortBy = sortFilter.value;
            state.currentPage = 1;
            resetAndReloadMovies();
        });
    }
};

/**
 * Set up reset button
 */
const setupResetButton = () => {
    const resetButton = document.getElementById('filter-reset');
    
    if (resetButton) {
        resetButton.addEventListener('click', async () => {
            // Reset all filters
            document.getElementById('genre-filter').value = '';
            document.getElementById('year-filter').value = '';
            document.getElementById('language-filter').value = '';
            document.getElementById('rating-filter').value = '';
            document.getElementById('sort-filter').value = 'popularity.desc';
            
            // Reset state
            state.genreId = null;
            state.year = null;
            state.language = null;
            state.minRating = null;
            state.sortBy = 'popularity.desc';
            state.currentPage = 1;
            
            // Update page title
            document.querySelector('.page-header h1').textContent = 'Movies';
            uiService.setPageTitle('Movies - JustStream');
            
            // Reload movies
            resetAndReloadMovies();
        });
    }
};

/**
 * Reset movies grid and reload content
 */
const resetAndReloadMovies = async () => {
    const moviesGrid = document.getElementById('movies-grid');
    moviesGrid.innerHTML = '';
    await loadMovies();
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
        
        // Create filters object for API call
        const filters = {
            sortBy: state.sortBy,
            genreId: state.genreId,
            year: state.year,
            language: state.language,
            minRating: state.minRating
        };
        
        // Fetch movies with filters
        const moviesData = await apiService.discoverMoviesWithFilters(
            filters,
            state.currentPage
        );
        
        // Update total pages
        state.totalPages = moviesData.total_pages;
        
        // Clear container if it's the first page
        if (state.currentPage === 1) {
            container.innerHTML = '';
        }
        
        // Check if there are any results
        if (moviesData.results.length === 0 && state.currentPage === 1) {
            container.innerHTML = '<div class="no-results">No movies found matching your filters. Try adjusting your criteria.</div>';
            loadMoreButton.style.display = 'none';
            return;
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