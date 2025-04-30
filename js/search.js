// Search functionality
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchAutocomplete = document.getElementById('search-autocomplete');

// Debounce timer
let searchTimeout = null;
const DEBOUNCE_DELAY = 300; // milliseconds to wait before firing search

// Event listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Add event listener for input to trigger autocomplete
searchInput.addEventListener('input', handleSearchInput);

// Add click event listener to document to close autocomplete when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchAutocomplete.contains(e.target)) {
        searchAutocomplete.style.display = 'none';
    }
});

// Add keydown event for navigation through autocomplete results
searchInput.addEventListener('keydown', (e) => {
    if (!searchAutocomplete.style.display || searchAutocomplete.style.display === 'none') {
        return;
    }

    const items = searchAutocomplete.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;

    const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < 0 || currentIndex >= items.length - 1) {
                // Select first item if none selected or at end
                selectAutocompleteItem(items, 0);
            } else {
                // Select next item
                selectAutocompleteItem(items, currentIndex + 1);
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (currentIndex <= 0) {
                // Select last item if none selected or at beginning
                selectAutocompleteItem(items, items.length - 1);
            } else {
                // Select previous item
                selectAutocompleteItem(items, currentIndex - 1);
            }
            break;
        case 'Tab':
        case 'Enter':
            e.preventDefault();
            if (currentIndex >= 0) {
                // Use the selected item
                const selectedItem = items[currentIndex];
                searchInput.value = selectedItem.querySelector('.autocomplete-title').textContent;
                searchAutocomplete.style.display = 'none';
                
                if (e.key === 'Enter') {
                    performSearch();
                }
            }
            break;
        case 'Escape':
            searchAutocomplete.style.display = 'none';
            break;
    }
});

// Search functions
function handleSearchInput() {
    const searchQuery = searchInput.value.trim();
    
    // Clear any existing timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // If empty query, hide autocomplete
    if (searchQuery.length === 0) {
        searchAutocomplete.style.display = 'none';
        return;
    }
    
    // Set new timeout to fetch autocomplete results
    searchTimeout = setTimeout(() => {
        fetchAutocompleteResults(searchQuery);
    }, DEBOUNCE_DELAY);
}

async function fetchAutocompleteResults(query) {
    if (query.length < 2) return; // Only search for 2+ characters
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Filter out person results and keep only movies and tv shows
            const filteredResults = data.results
                .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                .slice(0, 8); // Limit to 8 results for autocomplete
            
            // Display autocomplete results
            renderAutocompleteResults(filteredResults, query);
        } else {
            // No results found
            searchAutocomplete.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching autocomplete results:', error);
    }
}

function renderAutocompleteResults(items, query) {
    searchAutocomplete.innerHTML = '';
    
    if (items.length === 0) {
        searchAutocomplete.style.display = 'none';
        return;
    }
    
    items.forEach(item => {
        const mediaType = item.media_type;
        const title = item.title || item.name || 'Untitled';
        const posterPath = item.poster_path 
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/30x45?text=No+Poster';
        
        // Create result item
        const resultItem = document.createElement('div');
        resultItem.className = 'autocomplete-item';
        resultItem.dataset.id = item.id;
        resultItem.dataset.type = mediaType;
        
        // Highlight matching text in the title
        let highlightedTitle = title;
        if (query) {
            const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
            highlightedTitle = title.replace(regex, '<strong>$1</strong>');
        }
        
        resultItem.innerHTML = `
            <img src="${posterPath}" alt="${title}">
            <span class="autocomplete-title">${title}</span>
            <span class="autocomplete-type">
                <i class="fas ${mediaType === 'movie' ? 'fa-film' : 'fa-tv'}"></i>
                ${mediaType === 'movie' ? 'Movie' : 'TV Show'}
            </span>
        `;
        
        // Add click event to the result item
        resultItem.addEventListener('click', () => {
            searchInput.value = title;
            searchAutocomplete.style.display = 'none';
            performSearch();
        });
        
        searchAutocomplete.appendChild(resultItem);
    });
    
    searchAutocomplete.style.display = 'block';
}

function selectAutocompleteItem(items, index) {
    // Remove selected class from all items
    items.forEach(item => item.classList.remove('selected'));
    
    // Add selected class to the item at the specified index
    items[index].classList.add('selected');
    
    // Optionally scroll into view if needed
    items[index].scrollIntoView({ block: 'nearest' });
}

async function performSearch() {
    const searchQuery = searchInput.value.trim();
    
    if (searchQuery.length === 0) {
        return;
    }
    
    // Hide autocomplete
    searchAutocomplete.style.display = 'none';
    
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

// Helper function to escape special characters in a string for use in a regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}