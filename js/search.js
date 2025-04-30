// Search functionality
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Event listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Search functions
async function performSearch() {
    const searchQuery = searchInput.value.trim();
    
    if (searchQuery.length === 0) {
        return;
    }
    
    // Show search section
    showSection('search');
    
    // Show loading state
    document.getElementById('search-results').innerHTML = '<p>Searching for results...</p>';
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Filter out person results and keep only movies and tv shows
            const filteredResults = data.results.filter(item => 
                item.media_type === 'movie' || item.media_type === 'tv'
            );
            
            // Display search results
            renderContentGrid('search-results', filteredResults);
            
            // Update section heading
            document.querySelector('#search-section h2').textContent = `Search Results for "${searchQuery}"`;
        } else {
            document.getElementById('search-results').innerHTML = '<p>No results found. Try a different search term.</p>';
        }
    } catch (error) {
        console.error('Error during search:', error);
        document.getElementById('search-results').innerHTML = '<p>Error during search. Please try again.</p>';
    }
}

// Helper function to get media type icon and label
function getMediaTypeInfo(mediaType) {
    switch (mediaType) {
        case 'movie':
            return { icon: 'fa-film', label: 'Movie' };
        case 'tv':
            return { icon: 'fa-tv', label: 'TV Show' };
        default:
            return { icon: 'fa-question', label: 'Unknown' };
    }
}