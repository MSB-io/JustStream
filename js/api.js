/**
 * JustStream API Service
 * Handles all interactions with TMDB API
 */

class ApiService {
    constructor() {
        this.apiKey = CONFIG.tmdb.apiKey;
        this.baseUrl = CONFIG.tmdb.baseUrl;
    }

    /**
     * Makes a request to the TMDB API
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Additional parameters
     * @returns {Promise} - Fetch promise
     */
    async fetchFromTMDB(endpoint, params = {}) {
        // Add API key to params
        const queryParams = {
            api_key: this.apiKey,
            ...params
        };

        // Convert params object to URL query string
        const queryString = Object.keys(queryParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
            .join('&');

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}?${queryString}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching from TMDB:', error);
            throw error;
        }
    }

    /**
     * Fetches trending content (movies and TV shows)
     * @param {string} timeWindow - 'day' or 'week'
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getTrending(timeWindow = 'day', page = 1) {
        return this.fetchFromTMDB(`/trending/all/${timeWindow}`, { page });
    }

    /**
     * Fetches trending movies
     * @param {string} timeWindow - 'day' or 'week'
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getTrendingMovies(timeWindow = 'day', page = 1) {
        return this.fetchFromTMDB(`/trending/movie/${timeWindow}`, { page });
    }

    /**
     * Fetches trending TV shows
     * @param {string} timeWindow - 'day' or 'week'
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getTrendingTVShows(timeWindow = 'day', page = 1) {
        return this.fetchFromTMDB(`/trending/tv/${timeWindow}`, { page });
    }

    /**
     * Fetches popular movies
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getPopularMovies(page = 1) {
        return this.fetchFromTMDB('/movie/popular', { page });
    }

    /**
     * Fetches top rated movies
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getTopRatedMovies(page = 1) {
        return this.fetchFromTMDB('/movie/top_rated', { page });
    }

    /**
     * Fetches upcoming movies
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getUpcomingMovies(page = 1) {
        return this.fetchFromTMDB('/movie/upcoming', { page });
    }

    /**
     * Fetches popular TV shows
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getPopularTVShows(page = 1) {
        return this.fetchFromTMDB('/tv/popular', { page });
    }

    /**
     * Fetches top rated TV shows
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getTopRatedTVShows(page = 1) {
        return this.fetchFromTMDB('/tv/top_rated', { page });
    }

    /**
     * Fetches movie genres
     * @returns {Promise} - Fetch promise
     */
    getMovieGenres() {
        return this.fetchFromTMDB('/genre/movie/list');
    }

    /**
     * Fetches TV show genres
     * @returns {Promise} - Fetch promise
     */
    getTVGenres() {
        return this.fetchFromTMDB('/genre/tv/list');
    }

    /**
     * Fetches details for a movie
     * @param {number} id - Movie ID
     * @returns {Promise} - Fetch promise
     */
    getMovieDetails(id) {
        return this.fetchFromTMDB(`/movie/${id}`);
    }

    /**
     * Fetches details for a TV show
     * @param {number} id - TV show ID
     * @returns {Promise} - Fetch promise
     */
    getTVDetails(id) {
        return this.fetchFromTMDB(`/tv/${id}`);
    }

    /**
     * Fetches cast and crew for a movie
     * @param {number} id - Movie ID
     * @returns {Promise} - Fetch promise
     */
    getMovieCredits(id) {
        return this.fetchFromTMDB(`/movie/${id}/credits`);
    }

    /**
     * Fetches cast and crew for a TV show
     * @param {number} id - TV show ID
     * @returns {Promise} - Fetch promise
     */
    getTVCredits(id) {
        return this.fetchFromTMDB(`/tv/${id}/credits`);
    }

    /**
     * Fetches videos for a movie (trailers, teasers, etc.)
     * @param {number} id - Movie ID
     * @returns {Promise} - Fetch promise
     */
    getMovieVideos(id) {
        return this.fetchFromTMDB(`/movie/${id}/videos`);
    }

    /**
     * Fetches videos for a TV show (trailers, teasers, etc.)
     * @param {number} id - TV show ID
     * @returns {Promise} - Fetch promise
     */
    getTVVideos(id) {
        return this.fetchFromTMDB(`/tv/${id}/videos`);
    }

    /**
     * Fetches similar movies
     * @param {number} id - Movie ID
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getSimilarMovies(id, page = 1) {
        return this.fetchFromTMDB(`/movie/${id}/similar`, { page });
    }

    /**
     * Fetches similar TV shows
     * @param {number} id - TV show ID
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    getSimilarTVShows(id, page = 1) {
        return this.fetchFromTMDB(`/tv/${id}/similar`, { page });
    }

    /**
     * Fetches TV show season details
     * @param {number} id - TV show ID
     * @param {number} seasonNumber - Season number
     * @returns {Promise} - Fetch promise
     */
    getTVSeasonDetails(id, seasonNumber) {
        return this.fetchFromTMDB(`/tv/${id}/season/${seasonNumber}`);
    }

    /**
     * Searches for movies and TV shows
     * @param {string} query - Search query
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    searchMulti(query, page = 1) {
        return this.fetchFromTMDB('/search/multi', { query, page });
    }

    /**
     * Searches for movies
     * @param {string} query - Search query
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    searchMovies(query, page = 1) {
        return this.fetchFromTMDB('/search/movie', { query, page });
    }

    /**
     * Searches for TV shows
     * @param {string} query - Search query
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    searchTVShows(query, page = 1) {
        return this.fetchFromTMDB('/search/tv', { query, page });
    }

    /**
     * Discovers movies by genre
     * @param {number} genreId - Genre ID
     * @param {string} sortBy - Sorting option
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    discoverMoviesByGenre(genreId, sortBy = 'popularity.desc', page = 1) {
        return this.fetchFromTMDB('/discover/movie', { 
            with_genres: genreId,
            sort_by: sortBy,
            page
        });
    }

    /**
     * Discovers TV shows by genre
     * @param {number} genreId - Genre ID
     * @param {string} sortBy - Sorting option
     * @param {number} page - Page number
     * @returns {Promise} - Fetch promise
     */
    discoverTVShowsByGenre(genreId, sortBy = 'popularity.desc', page = 1) {
        return this.fetchFromTMDB('/discover/tv', { 
            with_genres: genreId,
            sort_by: sortBy,
            page
        });
    }
}

// Create a global instance of the ApiService
const apiService = new ApiService(); 