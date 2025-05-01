# JustStream - Free Online Streaming Platform

JustStream is a free online streaming platform where users can browse and watch movies and TV shows. The platform is built using HTML5, CSS3, and vanilla JavaScript, making it lightweight and easy to run on any modern web browser.

![JustStream](https://via.placeholder.com/1200x600?text=JustStream)

## Features

- **Browse Movies and TV Shows**: Explore trending, popular, and top-rated content.
- **Search Functionality**: Find specific movies or TV shows.
- **Genre Filtering**: Browse content by genre.
- **Detailed Information**: View cast, overview, ratings, and more for each title.
- **Embedded Video Player**: Watch content seamlessly within the platform.
- **TV Show Episode Management**: Navigate through seasons and episodes.
- **Responsive Design**: Optimized for all devices from mobile to desktop.
- **Dark Mode**: AMOLED-friendly dark theme for comfortable viewing.

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: The Movie Database (TMDB) API for metadata
- **Video Embedding**: VidSrc for video content
- **Design**: Custom CSS with CSS variables, Flexbox, and Grid for layouts

## Setup and Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A TMDB API key (get one from [TMDB](https://www.themoviedb.org/documentation/api))

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/juststream.git
   cd juststream
   ```

2. Open `js/config.js` and replace the placeholder API key with your TMDB API key:
   ```javascript
   apiKey: 'YOUR_TMDB_API_KEY', // Replace with your actual TMDB API key
   ```

3. Launch the website using a local server. You can use any of the following methods:

   - Using Python:
     ```
     python -m http.server
     ```

   - Using Node.js (with `http-server` package):
     ```
     npm install -g http-server
     http-server
     ```

   - Using Visual Studio Code's Live Server extension

4. Open your browser and navigate to the local server address (typically `http://localhost:8000` or similar).

## Project Structure

```
juststream/
├── css/
│   ├── normalize.css    # CSS reset for consistent styling
│   ├── styles.css       # Main stylesheet
│   └── responsive.css   # Media queries and responsive styles
├── js/
│   ├── api.js           # API service for TMDB interaction
│   ├── app.js           # Main application script (homepage)
│   ├── config.js        # Configuration and utility functions
│   ├── details.js       # Details page script
│   ├── movies.js        # Movies page script
│   ├── search.js        # Search page script
│   ├── tvshows.js       # TV Shows page script
│   ├── ui.js            # UI utilities and components
│   └── watch.js         # Watch page script
├── index.html           # Homepage
├── movies.html          # Movies page
├── tvshows.html         # TV Shows page
├── details.html         # Details page (for movies and TV shows)
├── search.html          # Search results page
├── watch.html           # Video player page
└── README.md            # Project documentation
```

## Usage

- **Homepage**: Displays trending and popular content.
- **Movies/TV Shows Pages**: Browse and filter movies or TV shows.
- **Search**: Use the search feature in the navigation bar to find specific titles.
- **Details**: Click on any media card to view detailed information.
- **Watch**: Click the "Watch Now" button on the details page to start streaming.

## Legal Disclaimer

This project is for educational purposes only. All media content is sourced through VidSrc and not hosted by this application. The metadata is sourced from TMDB API under their terms of service.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Movie Database (TMDB) for providing the API for metadata
- VidSrc for providing the streaming links
- All the developers and contributors to the libraries used in this project 