// Content Details Functions
async function loadContentDetails(contentId, type) {
    try {
        // Fetch content details
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${contentId}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data) {
            renderContentDetails(data, type);
            
            // Load player for the content
            if (type === 'movie') {
                loadMoviePlayer(contentId);
            } else if (type === 'tv') {
                // For TV shows, load season/episode data
                loadTVSeasons(contentId);
            }
        }
    } catch (error) {
        console.error('Error loading content details:', error);
        document.getElementById('content-details').innerHTML = '<p>Error loading content details. Please try again.</p>';
    }
}

function renderContentDetails(content, type) {
    const contentDetails = document.getElementById('content-details');
    const title = type === 'movie' ? content.title : content.name;
    const releaseDate = type === 'movie' ? content.release_date : content.first_air_date;
    const year = getYear(releaseDate);
    const posterPath = content.poster_path 
        ? `${TMDB_IMAGE_BASE_URL}${content.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    const rating = content.vote_average ? `${Math.round(content.vote_average * 10) / 10}/10` : 'N/A';
    
    let genresList = 'N/A';
    if (content.genres && content.genres.length > 0) {
        genresList = content.genres.map(genre => genre.name).join(', ');
    }
    
    let contentHTML = `
        <div class="details-header">
            <img src="${posterPath}" alt="${title}" class="details-poster">
            <div class="details-info">
                <h2 class="details-title">${title} ${year ? `(${year})` : ''}</h2>
                <div class="details-meta">
                    <span><i class="fas fa-star"></i> ${rating}</span>
                    <span><i class="fas ${type === 'movie' ? 'fa-film' : 'fa-tv'}"></i> ${type === 'movie' ? 'Movie' : 'TV Show'}</span>
                    <span><i class="fas fa-calendar"></i> ${releaseDate || 'N/A'}</span>
                </div>
                <p class="details-overview">${content.overview || 'No overview available.'}</p>
                <div class="details-genres"><strong>Genres:</strong> ${genresList}</div>
            </div>
        </div>
    `;
    
    contentDetails.innerHTML = contentHTML;
}

// Movie Player Functions
function loadMoviePlayer(movieId) {
    const playerContainer = document.getElementById('player-container');
    
    const playerHTML = `
        <iframe 
            src="${VIDSRC_BASE_URL}/movie/${movieId}" 
            width="100%" 
            height="500" 
            frameborder="0" 
            allowfullscreen
        ></iframe>
    `;
    
    playerContainer.innerHTML = playerHTML;
}

// TV Show Functions
async function loadTVSeasons(tvId) {
    try {
        // Fetch TV show details with seasons
        const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data && data.seasons) {
            renderTVSeasonSelector(tvId, data.seasons);
            
            // Load first season episodes by default if seasons exist
            if (data.seasons.length > 0) {
                const firstSeasonNumber = data.seasons[0].season_number;
                await loadTVEpisodes(tvId, firstSeasonNumber);
            }
        }
    } catch (error) {
        console.error('Error loading TV seasons:', error);
    }
}

function renderTVSeasonSelector(tvId, seasons) {
    const playerContainer = document.getElementById('player-container');
    
    // Filter out specials (season 0)
    const filteredSeasons = seasons.filter(season => season.season_number > 0);
    
    if (filteredSeasons.length === 0) {
        playerContainer.innerHTML = '<p>No seasons available for this TV show.</p>';
        return;
    }
    
    let seasonsHTML = '<div class="season-selector"><label for="season-select">Season:</label> ';
    seasonsHTML += '<select id="season-select">';
    
    filteredSeasons.forEach(season => {
        seasonsHTML += `<option value="${season.season_number}">Season ${season.season_number}</option>`;
    });
    
    seasonsHTML += '</select></div>';
    seasonsHTML += '<div id="episodes-container"></div>';
    
    playerContainer.innerHTML = seasonsHTML;
    
    // Add event listener to season select
    document.getElementById('season-select').addEventListener('change', (e) => {
        const selectedSeason = e.target.value;
        loadTVEpisodes(tvId, selectedSeason);
    });
}

async function loadTVEpisodes(tvId, seasonNumber) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data && data.episodes) {
            renderTVEpisodes(tvId, seasonNumber, data.episodes);
        }
    } catch (error) {
        console.error('Error loading TV episodes:', error);
    }
}

function renderTVEpisodes(tvId, seasonNumber, episodes) {
    const episodesContainer = document.getElementById('episodes-container');
    
    if (episodes.length === 0) {
        episodesContainer.innerHTML = '<p>No episodes available for this season.</p>';
        return;
    }
    
    let episodesHTML = '<h3>Episodes</h3>';
    episodesHTML += '<div class="episode-grid">';
    
    episodes.forEach(episode => {
        episodesHTML += `
            <div class="episode-item" data-episode="${episode.episode_number}">
                Ep ${episode.episode_number}
            </div>
        `;
    });
    
    episodesHTML += '</div>';
    episodesHTML += '<div id="tv-player"></div>';
    
    episodesContainer.innerHTML = episodesHTML;
    
    // Add event listeners to episode items
    document.querySelectorAll('.episode-item').forEach(item => {
        item.addEventListener('click', () => {
            const episodeNumber = item.getAttribute('data-episode');
            loadTVPlayer(tvId, seasonNumber, episodeNumber);
            
            // Highlight selected episode
            document.querySelectorAll('.episode-item').forEach(ep => {
                ep.style.backgroundColor = '';
            });
            item.style.backgroundColor = 'var(--accent-color)';
        });
    });
    
    // Load first episode by default
    if (episodes.length > 0) {
        loadTVPlayer(tvId, seasonNumber, episodes[0].episode_number);
        document.querySelector('.episode-item').style.backgroundColor = 'var(--accent-color)';
    }
}

function loadTVPlayer(tvId, seasonNumber, episodeNumber) {
    const tvPlayer = document.getElementById('tv-player');
    
    const playerHTML = `
        <iframe 
            src="${VIDSRC_BASE_URL}/tv/${tvId}/${seasonNumber}/${episodeNumber}" 
            width="100%" 
            height="500" 
            frameborder="0" 
            allowfullscreen
        ></iframe>
    `;
    
    tvPlayer.innerHTML = playerHTML;
}