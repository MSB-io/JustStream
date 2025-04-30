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

// Current State
let currentContentType = 'movie';

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
logoElement.addEventListener('click', () => showSection('home'));
closeModal.addEventListener('click', closeDetailsModal);

// Initialize Application
function initApp() {
    // Set document title
    document.title = 'JustStream - Watch Movies & TV Shows';
    
    // Set up navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            showSection(section);
        });
    });

    // Load initial content
    loadTrendingContent();
    loadMoviesContent();
    loadTVContent();
}

// Content Loading Functions
async function loadTrendingContent() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.results) {
            renderContentGrid('trending-content', data.results);
        }
    } catch (error) {
        console.error('Error loading trending content:', error);
    }
}

async function loadMoviesContent() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.results) {
            renderContentGrid('movies-content', data.results, 'movie');
        }
    } catch (error) {
        console.error('Error loading movie content:', error);
    }
}

async function loadTVContent() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.results) {
            renderContentGrid('tv-content', data.results, 'tv');
        }
    } catch (error) {
        console.error('Error loading TV content:', error);
    }
}

// UI Functions
function renderContentGrid(containerId, items, forcedType = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    items.forEach(item => {
        const contentType = forcedType || (item.media_type || (item.first_air_date ? 'tv' : 'movie'));
        const title = item.title || item.name || 'Untitled';
        const posterPath = item.poster_path 
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Poster';
            
        const contentCard = document.createElement('div');
        contentCard.className = 'content-card';
        contentCard.dataset.id = item.id;
        contentCard.dataset.type = contentType;
        
        contentCard.innerHTML = `
            <img src="${posterPath}" alt="${title}" class="content-poster">
            <div class="content-info">
                <h3 class="content-title">${title}</h3>
                <div class="content-type">
                    <i class="fas ${contentType === 'movie' ? 'fa-film' : 'fa-tv'}"></i>
                    ${contentType === 'movie' ? 'Movie' : 'TV Show'}
                </div>
            </div>
        `;
        
        contentCard.addEventListener('click', () => openDetailsModal(item.id, contentType));
        container.appendChild(contentCard);
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
}

function openDetailsModal(contentId, type) {
    currentContentType = type;
    
    // Reset modal content
    document.getElementById('content-details').innerHTML = '';
    document.getElementById('player-container').innerHTML = '';
    
    // Show loading state
    document.getElementById('content-details').innerHTML = '<p>Loading content details...</p>';
    
    // Load content details
    loadContentDetails(contentId, type);
    
    // Display modal
    detailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDetailsModal() {
    detailsModal.style.display = 'none';
    document.body.style.overflow = '';
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