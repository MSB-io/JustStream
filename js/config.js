/**
 * JustStream Configuration
 * Contains API endpoints, keys, and base URLs
 */

const CONFIG = {
    // TMDB API Configuration
    tmdb: {
        apiKey: '89bad794299700cf6fbe8a11164afcb1', // Replace with your actual TMDB API key
        baseUrl: 'https://api.themoviedb.org/3',
        imageBaseUrl: 'https://image.tmdb.org/t/p',
        backdropSize: 'original',
        posterSize: 'w500',
        profileSize: 'w185',
    },
    
    // VidSrc Configuration for embedding videos
    vidsrc: {
        baseUrl: 'https://vidsrc.to/embed',
    },
    
    // Multiembed Configuration for embedding videos
    multiembed: {
        baseUrl: 'https://multiembed.mov/directstream.php',
    }
};

// Image URL builder functions
const getImageUrl = (path, size) => {
    if (!path) return 'https://via.placeholder.com/300x450?text=No+Image';
    return `${CONFIG.tmdb.imageBaseUrl}/${size}/${path}`;
};

const getPosterUrl = (posterPath) => {
    return getImageUrl(posterPath, CONFIG.tmdb.posterSize);
};

const getBackdropUrl = (backdropPath) => {
    return getImageUrl(backdropPath, CONFIG.tmdb.backdropSize);
};

const getProfileUrl = (profilePath) => {
    return getImageUrl(profilePath, CONFIG.tmdb.profileSize);
};

// Watch URL builder
const getWatchUrl = (mediaType, id) => {
    return `watch.html?type=${mediaType}&id=${id}`;
};

// Details URL builder
const getDetailsUrl = (mediaType, id) => {
    return `details.html?type=${mediaType}&id=${id}`;
};

// Search results URL builder
const getSearchUrl = (query) => {
    return `search.html?query=${encodeURIComponent(query)}`;
};

// VidSrc embed URL builder
const getVidSrcUrl = (mediaType, id) => {
    return `${CONFIG.vidsrc.baseUrl}/${mediaType}/${id}`;
};

// Multiembed URL builder
const getMultiembedUrl = (mediaType, id, seasonNumber = null, episodeNumber = null, options = {}) => {
    // Base URL with video ID
    let url = `${CONFIG.multiembed.baseUrl}?video_id=${id}`;
    
    // Add tmdb parameter if using TMDB ID (default in our app)
    url += '&tmdb=1';
    
    // Add season and episode for TV shows
    if (mediaType === 'tv' && seasonNumber && episodeNumber) {
        url += `&s=${seasonNumber}&e=${episodeNumber}`;
    }
    
    // Add check parameter if needed
    if (options.check) {
        url += '&check=1';
    }
    
    // Add custom subtitles if provided
    if (options.subtitles) {
        url += `&sub_url=${encodeURIComponent(options.subtitles.url)}&sub_label=${encodeURIComponent(options.subtitles.label)}`;
    }
    
    return url;
};