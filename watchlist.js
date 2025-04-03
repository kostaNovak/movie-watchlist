// Your API key should be the same as in index.js
const apiKey = "5faec3bd";

// Function to load and display watchlist
async function loadWatchlist() {
  // Get elements
  const emptyWatchlist = document.getElementById("empty-watchlist");
  const watchlistContainer = document.getElementById("watchlist-list");

  // Get watchlist from localStorage
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  // Check if watchlist is empty
  if (watchlist.length === 0) {
    emptyWatchlist.style.display = "flex";
    watchlistContainer.style.display = "none";
    return;
  }

  // If we have movies, show the watchlist container and hide empty message
  emptyWatchlist.style.display = "none";
  watchlistContainer.style.display = "block";
  watchlistContainer.innerHTML = "";

  // Load each movie
  for (const movieId of watchlist) {
    await loadMovie(movieId, watchlistContainer);
  }

  // Setup remove buttons
  setupRemoveButtons();
}

// Load individual movie
async function loadMovie(movieId, container) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`
    );
    const movieData = await response.json();

    container.innerHTML += `
      <div class="movie-item">
        <img src="${movieData.Poster}" alt="${movieData.Title}" class="movie-poster">
        <div class="movie-info">
          <div class="movie-header">
            <h3 class="movie-title">${movieData.Title}</h3>
            <div class="movie-rating">
              <i class="fa-solid fa-star"></i>
              <span>${movieData.imdbRating}</span>
            </div>
          </div>
          <div class="movie-details">
            <span class="movie-year">${movieData.Year}</span>
            <span class="movie-runtime">${movieData.Runtime}</span>
            <span class="movie-genre">${movieData.Genre}</span>
          </div>
          <p class="movie-plot">${movieData.Plot}</p>
          <button class="watchlist-btn remove-btn" data-imdbid="${movieData.imdbID}">
            <i class="fa-solid fa-minus"></i>
            Remove
          </button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error loading movie:", error);
  }
}

// Setup remove buttons
function setupRemoveButtons() {
  const removeButtons = document.querySelectorAll(".remove-btn");

  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const movieId = this.getAttribute("data-imdbid");
      removeFromWatchlist(movieId);
    });
  });
}

// Remove movie from watchlist
function removeFromWatchlist(movieId) {
  // Get current watchlist
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  // Remove the movie
  watchlist = watchlist.filter((id) => id !== movieId);

  // Save updated watchlist
  localStorage.setItem("watchlist", JSON.stringify(watchlist));

  // Reload the watchlist display
  loadWatchlist();
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadWatchlist);
