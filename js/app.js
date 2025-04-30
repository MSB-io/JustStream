// Global Constants
const TMDB_API_KEY = '89bad794299700cf6fbe8a11164afcb1'; // Replace with your actual TMDb API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const VIDSRC_BASE_URL = 'https://vidsrc.to/embed';

// DOM Elements
const navItems = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('main section');
const logoElement = document.querySelector('.logo');
const detailsModal = document.getElementById('details-modal');
const closeModal = document.querySelector('.close-modal');

// Filter Elements
const movieGenreFilter = document.getElementById('movie-genre-filter');
const movieYearFilter = document.getElementById('movie-year-filter');
const movieLanguageFilter = document.getElementById('movie-language-filter');
const movieRatingFilter = document.getElementById('movie-rating-filter');
const movieFilterApplyBtn = document.getElementById('movie-filter-apply');
const movieFilterResetBtn = document.getElementById('movie-filter-reset');

const tvGenreFilter = document.getElementById('tv-genre-filter');
const tvYearFilter = document.getElementById('tv-year-filter');
const tvLanguageFilter = document.getElementById('tv-language-filter');
const tvRatingFilter = document.getElementById('tv-rating-filter');
const tvFilterApplyBtn = document.getElementById('tv-filter-apply');
const tvFilterResetBtn = document.getElementById('tv-filter-reset');

// Current State
let currentContentType = 'movie';
let movieFilters = { genre: '', year: '', language: '', rating: '' };
let tvFilters = { genre: '', year: '', language: '', rating: '' };
let availableMovieGenres = [];
let availableTVGenres = [];
let availableLanguages = [];

// Create decorative elements
function createDecorativeElements() {
    // Create random gradient circles in the background
    const colors = [
        'rgba(0, 85, 255, 0.05)',
        'rgba(94, 23, 235, 0.05)',
        'rgba(0, 85, 255, 0.08)',
        'rgba(94, 23, 235, 0.08)'
    ];
    
    const positions = [
        { top: '10%', left: '5%', size: '300px' },
        { top: '60%', left: '85%', size: '250px' },
        { top: '30%', left: '80%', size: '200px' },
        { top: '80%', left: '15%', size: '350px' }
    ];
    
    for (let i = 0; i < 4; i++) {
        const circle = document.createElement('div');
        circle.classList.add('gradient-circle');
        circle.style.top = positions[i].top;
        circle.style.left = positions[i].left;
        circle.style.width = positions[i].size;
        circle.style.height = positions[i].size;
        circle.style.background = colors[i];
        document.body.appendChild(circle);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
logoElement.addEventListener('click', () => showSection('home'));
closeModal.addEventListener('click', closeDetailsModal);

// Filter Event Listeners
movieFilterApplyBtn.addEventListener('click', applyMovieFilters);
movieFilterResetBtn.addEventListener('click', resetMovieFilters);
tvFilterApplyBtn.addEventListener('click', applyTVFilters);
tvFilterResetBtn.addEventListener('click', resetTVFilters);

// Initialize Application
function initApp() {
    // Set document title
    document.title = 'JustStream - Watch Movies & TV Shows';
    
    // Create decorative elements
    createDecorativeElements();
    
    // Set up navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            showSection(section);
        });
    });

    // Load initial content
    loadTrendingContent();
    
    // Load available filters
    loadGenres();
    loadLanguages();
    populateYearFilters();

    // Set default filters
    movieFilters = { genre: '', year: '', language: '', rating: '' };
    tvFilters = { genre: '', year: '', language: '', rating: '' };
    
    // Load content with default filters
    loadMoviesContent();
    loadTVContent();
}

// Content Loading Functions
async function loadTrendingContent() {
    try {
        // Show loading state
        const trendingContainer = document.getElementById('trending-content');
        // Loader already in the HTML
        
        const response = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            renderContentGrid('trending-content', data.results);
        } else {
            trendingContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-film"></i>
                    <p>No trending content found.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading trending content:', error);
        document.getElementById('trending-content').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading content. Please try again.</p>
            </div>
        `;
    }
}

async function loadMoviesContent() {
    try {
        // Show loading state
        const moviesContainer = document.getElementById('movies-content');
        // Loader already in the HTML
        
        // Build query parameters
        let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc`;
        
        if (movieFilters.genre) {
            url += `&with_genres=${movieFilters.genre}`;
        }
        
        if (movieFilters.year) {
            url += `&primary_release_year=${movieFilters.year}`;
        }
        
        if (movieFilters.language) {
            url += `&with_original_language=${movieFilters.language}`;
        }
        
        if (movieFilters.rating) {
            url += `&vote_average.gte=${movieFilters.rating}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            renderContentGrid('movies-content', data.results, 'movie');
        } else {
            moviesContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-film"></i>
                    <p>No movies found with the selected filters.</p>
                    <button class="btn btn-secondary" onclick="resetMovieFilters()">Reset Filters</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading movie content:', error);
        document.getElementById('movies-content').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading content. Please try again.</p>
            </div>
        `;
    }
}

async function loadTVContent() {
    try {
        // Show loading state
        const tvContainer = document.getElementById('tv-content');
        // Loader already in the HTML
        
        // Build query parameters
        let url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc`;
        
        if (tvFilters.genre) {
            url += `&with_genres=${tvFilters.genre}`;
        }
        
        if (tvFilters.year) {
            url += `&first_air_date_year=${tvFilters.year}`;
        }
        
        if (tvFilters.language) {
            url += `&with_original_language=${tvFilters.language}`;
        }
        
        if (tvFilters.rating) {
            url += `&vote_average.gte=${tvFilters.rating}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            renderContentGrid('tv-content', data.results, 'tv');
        } else {
            tvContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-tv"></i>
                    <p>No TV shows found with the selected filters.</p>
                    <button class="btn btn-secondary" onclick="resetTVFilters()">Reset Filters</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading TV content:', error);
        document.getElementById('tv-content').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading content. Please try again.</p>
            </div>
        `;
    }
}

// Filter Functions
async function loadGenres() {
    try {
        // Load movie genres
        const movieGenresResponse = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
        const movieGenresData = await movieGenresResponse.json();
        
        if (movieGenresData.genres) {
            availableMovieGenres = movieGenresData.genres;
            populateGenreFilter(movieGenreFilter, availableMovieGenres);
        }
        
        // Load TV genres
        const tvGenresResponse = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`);
        const tvGenresData = await tvGenresResponse.json();
        
        if (tvGenresData.genres) {
            availableTVGenres = tvGenresData.genres;
            populateGenreFilter(tvGenreFilter, availableTVGenres);
        }
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

async function loadLanguages() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/configuration/languages?api_key=${TMDB_API_KEY}`);
        const languages = await response.json();
        
        if (languages) {
            availableLanguages = languages;
            populateLanguageFilters(languages);
        }
    } catch (error) {
        console.error('Error loading languages:', error);
    }
}

function populateGenreFilter(selectElement, genres) {
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        selectElement.appendChild(option);
    });
}

function populateLanguageFilters(languages) {
    // Sort languages by English name
    languages.sort((a, b) => a.english_name.localeCompare(b.english_name));
    
    // Get the major languages first
    const majorLanguages = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'hi', 'ru'];
    
    // Add major languages first
    majorLanguages.forEach(code => {
        const language = languages.find(lang => lang.iso_639_1 === code);
        if (language) {
            addLanguageOption(movieLanguageFilter, language);
            addLanguageOption(tvLanguageFilter, language);
        }
    });
    
    // Add a separator
    const movieSeparator = document.createElement('option');
    movieSeparator.disabled = true;
    movieSeparator.textContent = '──────────';
    movieLanguageFilter.appendChild(movieSeparator);
    
    const tvSeparator = document.createElement('option');
    tvSeparator.disabled = true;
    tvSeparator.textContent = '──────────';
    tvLanguageFilter.appendChild(tvSeparator);
    
    // Add all other languages
    languages.forEach(language => {
        if (!majorLanguages.includes(language.iso_639_1)) {
            addLanguageOption(movieLanguageFilter, language);
            addLanguageOption(tvLanguageFilter, language);
        }
    });
}

function addLanguageOption(selectElement, language) {
    const option = document.createElement('option');
    option.value = language.iso_639_1;
    option.textContent = language.english_name;
    selectElement.appendChild(option);
}

function populateYearFilters() {
    const currentYear = new Date().getFullYear();
    
    // Populate years from current year down to 1900
    for (let year = currentYear; year >= 1900; year--) {
        addYearOption(movieYearFilter, year);
        addYearOption(tvYearFilter, year);
    }
}

function addYearOption(selectElement, year) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    selectElement.appendChild(option);
}

function applyMovieFilters() {
    movieFilters = {
        genre: movieGenreFilter.value,
        year: movieYearFilter.value,
        language: movieLanguageFilter.value,
        rating: movieRatingFilter.value
    };
    
    loadMoviesContent();
}

function resetMovieFilters() {
    movieGenreFilter.value = '';
    movieYearFilter.value = '';
    movieLanguageFilter.value = '';
    movieRatingFilter.value = '';
    
    movieFilters = { genre: '', year: '', language: '', rating: '' };
    
    loadMoviesContent();
}

function applyTVFilters() {
    tvFilters = {
        genre: tvGenreFilter.value,
        year: tvYearFilter.value,
        language: tvLanguageFilter.value,
        rating: tvRatingFilter.value
    };
    
    loadTVContent();
}

function resetTVFilters() {
    tvGenreFilter.value = '';
    tvYearFilter.value = '';
    tvLanguageFilter.value = '';
    tvRatingFilter.value = '';
    
    tvFilters = { genre: '', year: '', language: '', rating: '' };
    
    loadTVContent();
}

// UI Functions
function renderContentGrid(containerId, items, forcedType = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Add stagger delay for animation
    let delay = 0;
    const delayIncrement = 50; // ms
    
    items.forEach(item => {
        const contentType = forcedType || (item.media_type || (item.first_air_date ? 'tv' : 'movie'));
        const title = item.title || item.name || 'Untitled';
        const posterPath = item.poster_path 
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Poster';
        const year = item.release_date || item.first_air_date
            ? new Date(item.release_date || item.first_air_date).getFullYear()
            : '';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
            
        const contentCard = document.createElement('div');
        contentCard.className = 'content-card';
        contentCard.dataset.id = item.id;
        contentCard.dataset.type = contentType;
        contentCard.style.opacity = '0';
        contentCard.style.transform = 'translateY(20px)';
        contentCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        contentCard.style.transitionDelay = `${delay}ms`;
        
        let ratingHTML = '';
        if (rating) {
            ratingHTML = `
                <div class="content-rating">
                    <i class="fas fa-star"></i> ${rating}
                </div>
            `;
        }
        
        contentCard.innerHTML = `
            <img src="${posterPath}" alt="${title}" class="content-poster">
            ${ratingHTML}
            <div class="content-info">
                <h3 class="content-title">${title}</h3>
                <div class="content-type">
                    <i class="fas ${contentType === 'movie' ? 'fa-film' : 'fa-tv'}"></i>
                    ${contentType === 'movie' ? 'Movie' : 'TV Show'}
                    ${year ? `<span class="content-year">${year}</span>` : ''}
                </div>
            </div>
        `;
        
        contentCard.addEventListener('click', () => openDetailsModal(item.id, contentType));
        container.appendChild(contentCard);
        
        // Trigger animation after a small delay
        setTimeout(() => {
            contentCard.style.opacity = '1';
            contentCard.style.transform = 'translateY(0)';
        }, 10);
        
        // Increment delay for the next card
        delay += delayIncrement;
    });
}

function showSection(sectionName) {
    // Update navigation active state
    navItems.forEach(item => {
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Show selected section, hide others
    sections.forEach(section => {
        if (section.id === `${sectionName}-section`) {
            section.classList.remove('hidden-section');
            section.classList.add('active-section');
        } else {
            section.classList.remove('active-section');
            section.classList.add('hidden-section');
        }
    });
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function openDetailsModal(contentId, type) {
    currentContentType = type;
    
    // Reset modal content
    document.getElementById('content-details').innerHTML = `
        <div class="loader"></div>
        <div class="loading-text">Loading details...</div>
    `;
    document.getElementById('player-container').innerHTML = '';
    
    // Display modal with animation
    detailsModal.style.display = 'block';
    detailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load content details
    loadContentDetails(contentId, type);
}

function closeDetailsModal() {
    detailsModal.classList.remove('active');
    
    // Delay hiding the modal to complete the fade-out animation
    setTimeout(() => {
        detailsModal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// Helper Functions
function getYear(dateString) {
    return dateString ? new Date(dateString).getFullYear() : 'N/A';
}

// Enable closing modal when clicking outside of content
window.addEventListener('click', (event) => {
    if (event.target === detailsModal) {
        closeDetailsModal();
    }
});

// Add smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});