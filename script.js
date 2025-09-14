const titleInput = document.getElementById('title');
const searchBtn = document.getElementById('search-btn');
const similarBtn = document.getElementById('similar-btn');
const movieInfoDiv = document.getElementById('movie-info');

const API_KEY = 'http://www.omdbapi.com/?i=tt3896198&apikey=a4ca1f7f';
let currentMovie = null; // Store movie data for similar searches

async function fetchMovie(title, isSearch = true) {
    try {
        movieInfoDiv.innerHTML = '<p>Loading...</p>';
        similarBtn.disabled = true;

        const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch movie. Try again!');
        }
        const data = await response.json();

        if (data.Response === 'False') {
            throw new Error(data.Error || 'Movie or TV show not found!');
        }

        if (isSearch) {
            currentMovie = data; // Store for similar
            movieInfoDiv.innerHTML = `
                <h2>${data.Title} (${data.Year})</h2>
                <img src="${data.Poster !== 'N/A' ? data.Poster : 'placeholder.jpg'}" alt="${data.Title}">
                <p><strong>Rating:</strong> ${data.imdbRating}/10 (${data.imdbVotes} votes)</p>
                <p><strong>Plot:</strong> ${data.Plot}</p>
                <p><strong>Cast:</strong> ${data.Actors}</p>
                <p><strong>Genre:</strong> ${data.Genre}</p>
            `;
            similarBtn.disabled = false;
        } else {
            // For similar titles
            return data.Title;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        movieInfoDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        similarBtn.disabled = true;
    }
}

async function fetchSimilarTitles() {
    try {
        movieInfoDiv.innerHTML = '<p>Loading similar titles...</p>';
        const genre = currentMovie?.Genre?.split(', ')[0] || 'movie'; // Use first genre
        const url = `http://www.omdbapi.com/?s=${encodeURIComponent(genre)}&apikey=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch similar titles.');
        }
        const data = await response.json();

        if (data.Response === 'False') {
            throw new Error(data.Error || 'No similar titles found.');
        }

        // Get up to 3 similar titles (exclude the current movie)
        const similar = await Promise.all(
            data.Search.slice(0, 3)
                .filter(item => item.Title !== currentMovie.Title)
                .map(item => fetchMovie(item.Title, false))
        );

        movieInfoDiv.innerHTML = `
            <h2>Similar Titles to ${currentMovie.Title}</h2>
            <div class="similar-list">
                <ul>
                    ${similar.map(title => `<li>${title}</li>`).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        console.error('Similar fetch error:', error);
        movieInfoDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    if (!title) {
        movieInfoDiv.innerHTML = '<p class="error">Please enter a movie or TV show title!</p>';
        return;
    }
    fetchMovie(title);
});

similarBtn.addEventListener('click', fetchSimilarTitles);

// Fetch a default movie on load
fetchMovie('The Matrix');
