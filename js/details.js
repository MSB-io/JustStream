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
        document.getElementById('content-details').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading content details. Please try again.</p>
            </div>
        `;
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
    const backdropPath = content.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}${content.backdrop_path}`
        : null;
    const rating = content.vote_average ? `${Math.round(content.vote_average * 10) / 10}/10` : 'N/A';
    
    let genresList = 'N/A';
    if (content.genres && content.genres.length > 0) {
        genresList = content.genres.map(genre => genre.name).join(', ');
    }
    
    // Additional details
    const runtime = content.runtime ? `${content.runtime} min` : (content.episode_run_time && content.episode_run_time.length > 0 ? `~${content.episode_run_time[0]} min/episode` : 'N/A');
    const status = content.status || 'N/A';
    const languages = content.spoken_languages && content.spoken_languages.length > 0
        ? content.spoken_languages.map(lang => lang.english_name || lang.name).join(', ')
        : 'N/A';
    
    let contentHTML = `
        <div class="details-header">
            <img src="${posterPath}" alt="${title}" class="details-poster">
            <div class="details-info">
                <h2 class="details-title">${title} ${year ? `(${year})` : ''}</h2>
                <div class="details-meta">
                    <span><i class="fas fa-star"></i> ${rating}</span>
                    <span><i class="fas ${type === 'movie' ? 'fa-film' : 'fa-tv'}"></i> ${type === 'movie' ? 'Movie' : 'TV Show'}</span>
                    <span><i class="fas fa-calendar"></i> ${releaseDate || 'N/A'}</span>
                    <span><i class="fas fa-clock"></i> ${runtime}</span>
                    <span><i class="fas fa-globe"></i> ${languages}</span>
                    <span><i class="fas fa-flag-checkered"></i> ${status}</span>
                </div>
                
                <div class="details-genres"><strong>Genres:</strong> ${genresList}</div>
                
                <div class="details-overview">
                    ${content.overview || 'No overview available.'}
                </div>
                
                ${renderAdditionalDetails(content, type)}
            </div>
        </div>
    `;
    
    contentDetails.innerHTML = contentHTML;
    
    // Create backdrop effect if available
    if (backdropPath) {
        const backdropElement = document.createElement('div');
        backdropElement.className = 'backdrop-blur';
        backdropElement.style.backgroundImage = `url(${backdropPath})`;
        document.querySelector('.modal-content').prepend(backdropElement);
    }
}

function renderAdditionalDetails(content, type) {
    let html = '';
    
    // Add different details based on the content type
    if (type === 'movie') {
        const budget = content.budget ? `$${(content.budget / 1000000).toFixed(1)} million` : 'N/A';
        const revenue = content.revenue ? `$${(content.revenue / 1000000).toFixed(1)} million` : 'N/A';
        
        html += `
            <div class="additional-details">
                ${content.tagline ? `<div class="tagline">"${content.tagline}"</div>` : ''}
                
                <div class="details-stats">
                    ${budget !== 'N/A' ? `<div class="stat"><span>Budget:</span> ${budget}</div>` : ''}
                    ${revenue !== 'N/A' ? `<div class="stat"><span>Revenue:</span> ${revenue}</div>` : ''}
                </div>
            </div>
        `;
    } else if (type === 'tv') {
        const seasons = content.number_of_seasons || 'N/A';
        const episodes = content.number_of_episodes || 'N/A';
        const networks = content.networks && content.networks.length > 0
            ? content.networks.map(n => n.name).join(', ')
            : 'N/A';
        
        html += `
            <div class="additional-details">
                ${content.tagline ? `<div class="tagline">"${content.tagline}"</div>` : ''}
                
                <div class="details-stats">
                    <div class="stat"><span>Seasons:</span> ${seasons}</div>
                    <div class="stat"><span>Episodes:</span> ${episodes}</div>
                    <div class="stat"><span>Network:</span> ${networks}</div>
                </div>
            </div>
        `;
    }
    
    return html;
}

// Movie Player Functions
function loadMoviePlayer(movieId) {
    const playerContainer = document.getElementById('player-container');
    
    const playerHTML = `
        <h3 class="player-title">Watch Movie</h3>
        <iframe 
            src="${VIDSRC_BASE_URL}/movie/${movieId}" 
            width="100%" 
            height="500" 
            frameborder="0" 
            allowfullscreen
        ></iframe>
    `;
    
    playerContainer.innerHTML = playerHTML;
    
    // Animate player appearance
    animateElement(playerContainer);
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
                const firstValidSeason = data.seasons.find(season => season.season_number > 0);
                if (firstValidSeason) {
                    const firstSeasonNumber = firstValidSeason.season_number;
                    await loadTVEpisodes(tvId, firstSeasonNumber);
                }
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
        playerContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-tv"></i>
                <p>No seasons available for this TV show.</p>
            </div>
        `;
        return;
    }
    
    let seasonsHTML = `
        <h3 class="player-title">Watch TV Show</h3>
        <div class="season-selector">
            <label for="season-select">Season:</label>
            <select id="season-select">
    `;
    
    filteredSeasons.forEach(season => {
        const episodeCount = season.episode_count ? ` (${season.episode_count} episodes)` : '';
        seasonsHTML += `<option value="${season.season_number}">Season ${season.season_number}${episodeCount}</option>`;
    });
    
    seasonsHTML += '</select></div>';
    seasonsHTML += '<div id="episodes-container"></div>';
    
    playerContainer.innerHTML = seasonsHTML;
    
    // Add event listener to season select
    document.getElementById('season-select').addEventListener('change', (e) => {
        const selectedSeason = e.target.value;
        loadTVEpisodes(tvId, selectedSeason);
    });
    
    // Animate appearance
    animateElement(playerContainer);
}

async function loadTVEpisodes(tvId, seasonNumber) {
    try {
        const episodesContainer = document.getElementById('episodes-container');
        episodesContainer.innerHTML = `
            <div class="loader"></div>
            <div class="loading-text">Loading episodes...</div>
        `;
        
        const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data && data.episodes) {
            renderTVEpisodes(tvId, seasonNumber, data.episodes);
        }
    } catch (error) {
        console.error('Error loading TV episodes:', error);
        document.getElementById('episodes-container').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading episodes. Please try again.</p>
            </div>
        `;
    }
}

function renderTVEpisodes(tvId, seasonNumber, episodes) {
    const episodesContainer = document.getElementById('episodes-container');
    
    if (episodes.length === 0) {
        episodesContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-tv"></i>
                <p>No episodes available for this season.</p>
            </div>
        `;
        return;
    }
    
    let episodesHTML = '<h3>Episodes</h3>';
    episodesHTML += '<div class="episode-grid">';
    
    episodes.forEach(episode => {
        episodesHTML += `
            <div class="episode-item" data-episode="${episode.episode_number}">
                <span>Ep ${episode.episode_number}</span>
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
                ep.classList.remove('selected');
            });
            item.classList.add('selected');
        });
    });
    
    // Load first episode by default
    if (episodes.length > 0) {
        loadTVPlayer(tvId, seasonNumber, episodes[0].episode_number);
        document.querySelector('.episode-item').classList.add('selected');
    }
    
    // Add stagger animation to episode items
    animateEpisodes();
}

function loadTVPlayer(tvId, seasonNumber, episodeNumber) {
    const tvPlayer = document.getElementById('tv-player');
    
    const playerHTML = `
        <h3 class="player-subtitle">S${seasonNumber} · E${episodeNumber}</h3>
        <iframe 
            src="${VIDSRC_BASE_URL}/tv/${tvId}/${seasonNumber}/${episodeNumber}" 
            width="100%" 
            height="500" 
            frameborder="0" 
            allowfullscreen
        ></iframe>
    `;
    
    tvPlayer.innerHTML = playerHTML;
    
    // Animate player appearance
    animateElement(tvPlayer);
}

// Animation helpers
function animateElement(element) {
    element.style.opacity = 0;
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        element.style.opacity = 1;
        element.style.transform = 'translateY(0)';
    }, 50);
}

function animateEpisodes() {
    const episodes = document.querySelectorAll('.episode-item');
    
    episodes.forEach((episode, index) => {
        episode.style.opacity = 0;
        episode.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            episode.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            episode.style.opacity = 1;
            episode.style.transform = 'translateY(0)';
        }, 30 * index); // Stagger effect
    });
}