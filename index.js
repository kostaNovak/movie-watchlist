// Your API key
const apiKey = "5faec3bd";

// Function to search for movies
async function searchMovies(searchTerm) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // For JSON responses

    console.log(data);

    displayMovies(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Re-throw the error if you want calling code to handle it
  }
}

function debounce(func, delay) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

async function handleSearchInput() {
  const searchTerm = searchInput.value.trim();

  // Create or get search preview container
  let searchPreview = document.getElementById("search-preview");
  if (!searchPreview) {
    searchPreview = document.createElement("div");
    searchPreview.id = "search-preview";
    searchPreview.className = "search-preview";
    document.querySelector(".search-bar-container").appendChild(searchPreview);
  }

  // Clear preview if search is empty
  if (searchTerm.length < 3) {
    searchPreview.innerHTML = "";
    searchPreview.style.display = "none";
    return;
  }

  try {
    // Fetch quick search results
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}&type=movie`
    );
    const data = await response.json();

    // Display preview results
    if (data.Response === "True") {
      searchPreview.style.display = "block";
      searchPreview.innerHTML = "";

      // Limit to first 5 results
      const previewResults = data.Search.slice(0, 5);

      previewResults.forEach((movie) => {
        const preview = document.createElement("div");
        preview.className = "preview-item";
        preview.innerHTML = `
          <img src="${
            movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"
          }" alt="${movie.Title}">
          <div>
            <p class="preview-title">${movie.Title}</p>
            <p class="preview-year">${movie.Year}</p>
          </div>
        `;

        // Make each preview item clickable to show full details
        preview.addEventListener("click", () => {
          searchInput.value = movie.Title;
          searchPreview.style.display = "none";
          searchMovies(movie.Title);
        });

        searchPreview.appendChild(preview);
      });

      // Show a "See all results" option
      if (data.Search.length > 5) {
        const seeAll = document.createElement("div");
        seeAll.className = "preview-see-all";
        seeAll.textContent = `See all ${data.totalResults} results`;
        seeAll.addEventListener("click", () => {
          document
            .getElementById("search-form")
            .dispatchEvent(new Event("submit"));
        });
        searchPreview.appendChild(seeAll);
      }
    } else {
      searchPreview.innerHTML =
        '<div class="preview-no-results">No movies found</div>';
    }
  } catch (error) {
    console.error("Error with search preview:", error);
    searchPreview.innerHTML =
      '<div class="preview-no-results">Error loading results</div>';
  }
}

// Add event listener to close preview when clicking outside
document.addEventListener("click", (e) => {
  const searchPreview = document.getElementById("search-preview");
  const searchBar = document.querySelector(".search-bar");

  if (
    searchPreview &&
    !searchBar.contains(e.target) &&
    !searchPreview.contains(e.target)
  ) {
    searchPreview.style.display = "none";
  }
});

function setupWatchlistButtons() {
  // Get all watchlist buttons
  const watchlistButtons = document.querySelectorAll(".watchlist-btn");

  console.log(`Found ${watchlistButtons.length} watchlist buttons`);

  // Add click event listeners to each button
  watchlistButtons.forEach((button, index) => {
    button.addEventListener("click", function (e) {
      // Get the movie ID from the button's data attribute
      const movieId = this.getAttribute("data-imdbid");

      let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

      if (!watchlist.includes(movieId)) {
        // Add to watchlist
        watchlist.push(movieId);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));

        // Update button appearance
        this.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
        this.classList.add("active");
      } else {
        // Movie is already in watchlist - you could update the button or show a message
        console.log("Movie already in watchlist");
      }
    });
  });
}

async function displayMovies(data) {
  // Check if we have valid results
  if (data.Response === "True") {
    // Hide the placeholder

    const startExploring = document.getElementById("start-exploring");
    if (startExploring) {
      startExploring.style.display = "none";
    }

    // Get the movie list container
    const movieList = document.getElementById("movie-list");

    // Clear any previous results
    movieList.innerHTML = "";

    // Loop through the movies and create HTML for each one
    // Your code here...
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    for (const movie of data.Search) {
      // Get detailed info for each movie
      try {
        // Here's where you make the additional API call
        const detailResponse = await fetch(
          `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`
        );
        const movieDetails = await detailResponse.json();

        // Now use movieDetails to access the additional information
        console.log(movieDetails); // See all the available data

        const isInWatchlist = watchlist.includes(movieDetails.imdbID);
        // Build your HTML with the detailed info
        movieList.innerHTML += `
          <div class="movie-item">
            <img src="${movieDetails.Poster}" alt="${
          movieDetails.Title
        }" class="movie-poster">
            <div class="movie-info">
              <div class="movie-header">
                <h3 class="movie-title">${movieDetails.Title}</h3>
                <div class="movie-rating">
                  <i class="fa-solid fa-star"></i>
                  <span>${movieDetails.imdbRating}</span>
                </div>
              </div>
              <div class="movie-details">
                <span class="movie-year">${movieDetails.Year}</span>
                <span class="movie-runtime">${movieDetails.Runtime}</span>
                <span class="movie-genre">${movieDetails.Genre}</span>
              </div>
              <p class="movie-plot">${movieDetails.Plot}</p>
              <button class="watchlist-btn ${
                isInWatchlist ? "active" : ""
              }" data-imdbid="${movieDetails.imdbID}">
              <i class="fa-solid ${isInWatchlist ? "fa-check" : "fa-plus"}"></i>
              ${isInWatchlist ? "Added" : "Watchlist"}
              </button>
            </div>
          </div>
        `;
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    }
  } else {
    // Handle case where no movies were found
    console.log("No movies found:", data.Error);
    // You could show an error message to the user here
  }
  setupWatchlistButtons();
}

// Wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the search form
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", debounce(handleSearchInput, 500));

  // Add submit event listener
  searchForm.addEventListener("submit", function (e) {
    // Prevent default form submission
    e.preventDefault();

    // Get the search input value
    const searchInput = document.getElementById("search-input");
    const searchTerm = searchInput.value.trim();

    // Call a function to search for movies
    // Your code here...

    if (searchTerm) {
      searchMovies(searchTerm);
    }
  });
});
const searchInput = document.getElementById("search-input");
const searchPreview = document.getElementById("search-preview");

searchInput.addEventListener("input", function () {
  const searchTerm = this.value.trim();

  // Only search if we have at least 3 characters
  if (searchTerm.length < 3) {
    searchPreview.innerHTML = "";
    searchPreview.style.display = "none";
    return;
  }

  // Fetch quick results
  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}&type=movie`)
    .then((response) => response.json())
    .then((data) => {
      // Clear previous results
      searchPreview.innerHTML = "";

      if (data.Response === "True") {
        searchPreview.style.display = "block";

        // Show up to 5 results
        const movies = data.Search.slice(0, 5);

        movies.forEach((movie) => {
          const item = document.createElement("div");
          item.className = "preview-item";
          item.innerHTML = `
            <img src="${
              movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"
            }" alt="${movie.Title}">
            <div>
              <p class="preview-title">${movie.Title}</p>
              <p class="preview-year">${movie.Year}</p>
            </div>
          `;

          // Add click event
          item.addEventListener("click", function () {
            searchInput.value = movie.Title;
            searchPreview.style.display = "none";
            document
              .getElementById("search-form")
              .dispatchEvent(new Event("submit"));
          });

          searchPreview.appendChild(item);
        });
      } else {
        searchPreview.innerHTML =
          '<div class="preview-no-results">No results found</div>';
        searchPreview.style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Error with search preview:", error);
    });
});

// Close preview when clicking outside
document.addEventListener("click", function (e) {
  if (!searchInput.contains(e.target) && !searchPreview.contains(e.target)) {
    searchPreview.style.display = "none";
  }
});
