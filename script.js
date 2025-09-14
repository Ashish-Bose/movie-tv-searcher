const titleInput = document.getElementById('title');
const searchBtn = document.getElementById('search-btn');
const similarBtn = document.getElementById('similar-btn');
const movieInfoDiv = document.getElementById('movie-info');

const API_KEY = 'a4ca1f7f'; // Replace with your actual OMDB key (e.g., '123abc45')
let currentMovie = null;

async function fetchMovie(title) {
    try {
        movieInfoDiv.innerHTML = '<p>Loading...</p>';
        similarBtn.disabled = true;

        // Use HTTPS directly, no proxy
        const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`;
        
        console.log('Fetching URL:', url); // Debug: Exact URL
        
        const response = await fetch(url);
        console.log('Response status:', response.status); // Debug: Should be 200
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: Failed to fetch movie. ${errorText.substring(0, 100)}...`);
        }
        const data = await response.json();
        console.log('API data:', data); // Debug: Full JSON

        if (data.Response === 'False') {
            throw new Error(data.Error || 'Movie or TV show not found!');
        }

        currentMovie = data;
        movieInfoDiv.innerHTML = `
            <h2>${data.Title} (${data.Year})</h2>
            <img src="${data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${data.Title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <p><strong>Rating:</strong> ${data.imdbRating || 'N/A'}/10 (${data.imdbVotes || 'N/A'} votes)</p>
            <p><strong>Plot:</strong> ${data.Plot || 'No plot available'}</p>
            <p><strong>Cast:</strong> ${data.Actors || 'N/A'}</p>
            <p><strong>Genre:</strong> ${data.Genre || 'N/A'}</p>
        `;
        similarBtn.disabled = false;
    } catch (error) {
        console.error('Full fetch error:', error.message, error.stack);
        movieInfoDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        similarBtn.disabled = true;
    }
}

async function fetchSimilarTitles() {
    try {
        movieInfoDiv.innerHTML = '<p>Loading similar titles...</p>';
        const genre = currentMovie?.Genre?.split(', ')[0] || 'Action';
        
        const url = `https://www.omdbapi.com/?s=${encodeURIComponent(genre)}&type=movie&apikey=${API_KEY}`;
        console.log('Similar URL:', url);
        
        const response = await fetch(url);
        console.log('Similar status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: Failed to fetch similar titles. ${errorText.substring(0, 100)}...`);
        }
        const data = await response.json();
        console.log('Similar data:', data);

        if (data.Response === 'False') {
            throw new Error(data.Error || 'No similar titles found.');
        }

        const similarMovies = data.Search ? data.Search.slice(0, 3).filter(item => item.Title !== currentMovie.Title) : [];
        movieInfoDiv.innerHTML = `
            <h2>Similar Titles to ${currentMovie.Title}</h2>
            <div class="similar-list">
                <ul>
                    ${similarMovies.map(item => `<li>${item.Title} (${item.Year})</li>`).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        console.error('Similar error:', error.message, error.stack);
        movieInfoDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

searchBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    if (!title) {
        movieInfoDiv.innerHTML = '<p class="error">Please enter a movie or TV show title!</p>';
        return;
    }
    fetchMovie(title);
});

similarBtn.addEventListener('click', fetchSimilarTitles);

fetchMovie('The Matrix');
