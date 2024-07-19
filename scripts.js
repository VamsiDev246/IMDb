document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const logoutLink = document.getElementById("logoutLink");

  if (registerForm) {
    registerForm.addEventListener("submit", registerUser);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", loginUser);
  }

  if (logoutLink) {
    logoutLink.addEventListener("click", logoutUser);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", showPreviousFanFavorites);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", showNextFanFavorites);
  }

  if (window.location.pathname.endsWith("results.html")) {
    displayResults();
  }
});

loadCarouselMovies();
loadFanFavorites();
loadWeekTop10();

let currentFanFavoriteIndex = 0;
const fanFavoritesPerPage = 6;
let fanFavorites = [];
let weekTop10 = [];

function isLoggedIn() {
  return localStorage.getItem("loggedInUser") !== null;
}

async function registerUser(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Check if the email already exists
  const existingUserResponse = await fetch(`https://json-piu7.onrender.com/users?email=${email}`);
  const existingUser = await existingUserResponse.json();

  if (existingUser.length > 0) {
      alert("An account with this email already exists. Please use a different email.");
      return;
  }

  // If email doesn't exist, proceed with registration
  const response = await fetch("https://json-piu7.onrender.com/users", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
  });

  if (response.ok) {
      alert("User registered successfully!");
      window.location.href = "login.html";
  } else {
      alert("Registration failed.");
  }
}


async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(
    `https://json-piu7.onrender.com/users?email=${email}&password=${password}`
  );
  const users = await response.json();

  if (users.length > 0) {
    localStorage.setItem("loggedInUser", JSON.stringify(users[0]));
    alert("Login successful!");
    window.location.href = "dashboard.html"; // Redirect to the dashboard page
  } else {
    alert("Invalid email or password.");
  }
}

async function showSuggestions(query) {
  const suggestionsBox = document.getElementById("suggestions");
  suggestionsBox.innerHTML = "";

  if (query.length < 3) {
    suggestionsBox.classList.remove("show");
    return;
  }

  const response = await fetch(`https://json-piu7.onrender.com/suggestions?q=${query}`);
  const suggestions = await response.json();

  suggestions.forEach((item) => {
    const suggestionItem = document.createElement("a");
    suggestionItem.className = "dropdown-item";
    suggestionItem.href = `#`; // Prevent default navigation
    suggestionItem.innerHTML = `
          <div class="d-flex align-items-center">
              <img src="${item.primaryImage.imageUrl}" alt="${item.originalTitleText.text}" class="img-thumbnail" style="width: 50px; height: 50px; margin-right: 10px;">
              <span>${item.originalTitleText.text}</span>
          </div>
      `;
    suggestionItem.addEventListener("click", () => {
      handleSuggestionClick(item.id);
    });
    suggestionsBox.appendChild(suggestionItem);
  });

  if (suggestions.length > 0) {
    suggestionsBox.classList.add("show");
  } else {
    suggestionsBox.classList.remove("show");
  }
}

async function loadCarouselMovies() {
  const response = await fetch("https://json-piu7.onrender.com/carouselMovies");
  const carouselMovies = await response.json();

  const carouselInner = document.getElementById("carouselInner");
  carouselMovies.forEach((movie, index) => {
    const carouselItem = document.createElement("div");
    carouselItem.className = `carousel-item ${index === 0 ? "active" : ""}`;
    carouselItem.innerHTML = `
            <img src="${movie.primaryImage.imageUrl}" class="d-block w-100" alt="${movie.titleText.text}">
            <div class="carousel-caption d-none d-md-block">
                <h5>${movie.titleText.text}</h5>
                <p>${movie.plot.plotText.plainText}</p>
            </div>
        `;
    carouselInner.appendChild(carouselItem);
  });
}

async function loadFanFavorites() {
  const response = await fetch("https://json-piu7.onrender.com/fanFavorites");
  fanFavorites = await response.json();

  // Sort fan favorites by rating
  fanFavorites.sort(
    (b, a) =>
      a.ratingsSummary.aggregateRating - b.ratingsSummary.aggregateRating
  );

  // Load initial fan favorites
  displayFanFavorites();
}

function displayFanFavorites() {
  const fanFavoritesContainer = document.getElementById("fanFavorites");
  fanFavoritesContainer.innerHTML = "";
  const endIndex = currentFanFavoriteIndex + fanFavoritesPerPage;
  const fanFavoritesToDisplay = fanFavorites.slice(
    currentFanFavoriteIndex,
    endIndex
  );

  fanFavoritesToDisplay.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "col-md-4";
    movieCard.onclick = () => handleCardClick("fanFavorite", movie.id);
    movieCard.innerHTML = `
            <div class="card" style="width: 18rem; cursor: pointer;" >
                <img src="${movie.primaryImage.imageUrl}" class="card-img-top" alt="${movie.titleText.text}">
                <div class="card-body">
                    <h5 class="card-title text-truncate">${movie.titleText.text}</h5>
                    <p class="card-text"><i class="fa fa-star style="font-size:20px"></i>: ${movie.ratingsSummary.aggregateRating}</p>
                 
                </div>
            </div>
        `;
    fanFavoritesContainer.appendChild(movieCard);
  });
}

function handleSuggestionClick(movieId) {
  if (isLoggedIn()) {
    window.location.href = `results.html?suggestion=${movieId}`;
  } else {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
  }
}

function handleCardClick(cardtype, movieId) {
  if (isLoggedIn()) {
    window.location.href = `results.html?${cardtype}=${movieId}`;
  } else {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
  }
}

function logoutUser(event) {
  event.preventDefault();
  localStorage.removeItem("loggedInUser");
  alert("You have been logged out.");
  window.location.href = "index.html";
}

function showNextFanFavorites() {
  if (currentFanFavoriteIndex + fanFavoritesPerPage < fanFavorites.length) {
    currentFanFavoriteIndex += fanFavoritesPerPage;
    displayFanFavorites();
  }
}

function showPreviousFanFavorites() {
  if (currentFanFavoriteIndex > 0) {
    currentFanFavoriteIndex -= fanFavoritesPerPage;
    displayFanFavorites();
  }
}

async function loadWeekTop10() {
  const response = await fetch("https://json-piu7.onrender.com/weekTop10");
  weekTop10 = await response.json();

  // Sort week top 10 by current rank
  weekTop10.sort(
    (a, b) => a.chartMeterRanking.currentRank - b.chartMeterRanking.currentRank
  );

  const weekTop10Container = document.getElementById("weekTop10");
  weekTop10.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "col-md-4";
    movieCard.onclick = () => handleCardClick("weekTop10", movie.id);
    movieCard.innerHTML = `
            <div class="card" style="width: 18rem; cursor: pointer;">
                <img src="${movie.primaryImage.imageUrl}" class="card-img-top" alt="${movie.titleText.text}">
                <div class="card-body">
                    <h5 class="card-title text-truncate">${movie.titleText.text}</h5>
                    <p class="card-text"><i class="fa fa-star" style="font-size:20px"></i>: ${movie.ratingsSummary.aggregateRating}</p>
                    <p class="card-text">Current Rank: ${movie.chartMeterRanking.currentRank}</p>
                </div>
            </div>
        `;
    weekTop10Container.appendChild(movieCard);
  });
}

// Store watchlist in localStorage
function addToWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist.push(movie);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  alert("Added to watchlist!");
}

async function displayResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("suggestion");
  const fanFavoriteId = urlParams.get("fanFavorite");
  const weekTop10Id = urlParams.get("weekTop10");
  const resultsContainer = document.getElementById("resultsContainer");
  let response;
  let movie;

  if (searchQuery) {
    response = await fetch(`https://json-piu7.onrender.com/suggestions/${searchQuery}`);
    movie = await response.json();
  } else if (fanFavoriteId) {
    response = await fetch(
      `https://json-piu7.onrender.com/fanFavorites/${fanFavoriteId}`
    );
    movie = await response.json();
  } else if (weekTop10Id) {
    response = await fetch(`https://json-piu7.onrender.com/weekTop10/${weekTop10Id}`);
    movie = await response.json();
  }

  if (movie) {
    resultsContainer.innerHTML = `
            <div class="card" style="width: 24rem;">
                <img src="${
                  movie.primaryImage.imageUrl
                }" class="card-img-top" alt="${movie.titleText.text}">
                <div class="card-body">
                    <h5 class="card-title">${movie.titleText.text}</h5>
                    <p class="card-text"><i class="fa fa-star" style="font-size:20px"></i>: ${
                      movie.ratingsSummary.aggregateRating
                    }</p>
                    <p class="card-text">Release Year: ${
                      movie.releaseYear.year
                    }</p>
                    <p class="card-text">Type: ${movie.titleType.text}</p>
                    <p class="card-text">${movie.plot.plotText.plainText}</p>
                    
                    <button class="btn btn-secondary" onclick="addToWatchlist(${JSON.stringify(
                      movie
                    ).replace(/"/g, "&quot;")})">Add to Watchlist</button>
                </div>
            </div>
        `;
  } else {
    resultsContainer.innerHTML = `<p class="ptag">No results found.</p>`;
  }
}

function displayWatchlist() {
  const watchlistContainer = document.getElementById("watchlistContainer");
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  watchlistContainer.innerHTML = "";
  watchlist.forEach((movie, index) => {
    const movieCard = document.createElement("div");
    movieCard.className = "col-md-4";
    movieCard.innerHTML = `
            <div class="card" style="width: 18rem; position: relative;">
                <button type="button" class="close" aria-label="Close" onclick="removeFromWatchlist(${index})">
                    <span aria-hidden="true">&times;</span>
                </button>
                <img src="${
                  movie.primaryImage.imageUrl
                }" class="card-img-top" alt="${movie.titleText.text}">
                <div class="card-body">
                    <h5 class="card-title text-truncate">${
                      movie.titleText.text
                    }</h5>
                    <p class="card-text">Rating: ${
                      movie.ratingsSummary.aggregateRating
                    }</p>
                    
                </div>
            </div>
        `;
    watchlistContainer.appendChild(movieCard);
  });
}

function removeFromWatchlist(index) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist.splice(index, 1);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  displayWatchlist();
}

// Ensure the functions run when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("results.html")) {
    displayResults();
  } else if (path.includes("watchlist.html")) {
    displayWatchlist();
  }
});
