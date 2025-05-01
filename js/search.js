/**
 * JustStream - Search Page Script
 * Handles search functionality and results display
 */

// Page state
const state = {
    currentPage: 1,
    totalPages: 0,
    query: '',
    filterType: 'all' // 'all', 'movie', or 'tv'
};

// Function to initialize the search page
const initSearchPage = async () => {
    try {
        // Get URL parameters
        const params = uiService.getUrlParams();
        
        // Check if query parameter is present
        if (!params.query) {
            throw new Error('No search query provided');
        }
        
        // Store query
        state.query = params.query;
        
        // Update query display
        document.getElementById('search-query').textContent = state.query;
        
        // Update page title
        uiService.setPageTitle(`Search: ${state.query}`);
        
        // Set up filter type dropdown
        setupFilterType();
        
        // Perform search
        await performSearch();
        
        // Set up load more button
        setupLoadMore();
        
    } catch (error) {
        console.error('Error initializing search page:', error);
        document.querySelector('.media-grid-container').innerHTML = `
            <div class="error-container">
                <h2>Error</h2>
                <p>${error.message || 'Something went wrong. Please try again.'}</p>
                <a href="index.html" class="btn-primary">Back to Home</a>
            </div>
        `;
    }
};

/**
 * Set up filter type dropdown
 */
const setupFilterType = () => {
    const filterType = document.getElementById('filter-type');
    
    if (filterType) {
        // Set initial value from state
        filterType.value = state.filterType;
        
        // Add change event listener
        filterType.addEventListener('change', async () => {
            state.filterType = filterType.value;
            state.currentPage = 1;
            
            // Reset and reload search results
            await performSearch();
        });
    }
};

/**
 * Perform search based on current state
 */
const performSearch = async () => {
    try {
        const resultsContainer = document.getElementById('search-results');
        const noResultsContainer = document.getElementById('no-results');
        const loadMoreButton = document.getElementById('load-more');
        
        // Show loading if it's the first page
        if (state.currentPage === 1) {
            uiService.showLoading(resultsContainer);
            noResultsContainer.style.display = 'none';
        }
        
        // Perform search based on filter type
        let searchResults;
        
        if (state.filterType === 'movie') {
            searchResults = await apiService.searchMovies(state.query, state.currentPage);
        } else if (state.filterType === 'tv') {
            searchResults = await apiService.searchTVShows(state.query, state.currentPage);
        } else {
            searchResults = await apiService.searchMulti(state.query, state.currentPage);
        }
        
        // Update total pages
        state.totalPages = searchResults.total_pages;
        
        // Clear container if it's the first page
        if (state.currentPage === 1) {
            resultsContainer.innerHTML = '';
        }
        
        // Check if there are any results
        if (searchResults.results.length === 0 && state.currentPage === 1) {
            noResultsContainer.style.display = 'block';
            loadMoreButton.style.display = 'none';
            return;
        }
        
        // Display search results
        searchResults.results.forEach(result => {
            // Skip results that are not movies or TV shows (e.g., people)
            if (result.media_type && result.media_type !== 'movie' && result.media_type !== 'tv') {
                return;
            }
            
            const card = uiService.createMediaCard(result);
            resultsContainer.appendChild(card);
        });
        
        // Show/hide load more button
        if (state.currentPage >= state.totalPages) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error performing search:', error);
        const resultsContainer = document.getElementById('search-results');
        
        if (state.currentPage === 1) {
            uiService.showError(resultsContainer);
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
            await performSearch();
        });
    }
};

// Initialize the search page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initSearchPage); 