const TMDB_KEY = '6d264ad4583b8046c78fa49c9a26a7f0';
let currentTab = 'anime';
let currentGenre = '';
let currentYear = '';
let currentPage = 1;
let isLoadingMore = false;

// Populate year dropdown
function populateYears() {
  const yearSelect = document.getElementById('year-select');
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1960; y--) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }
}

populateYears();

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    currentPage = 1;

    if (currentTab === 'anime') {
      document.getElementById('hero-title').textContent = 'Discover Trending Anime';
      document.getElementById('hero-sub').textContent = 'Search thousands of anime titles instantly';
      document.getElementById('search-input').placeholder = 'Search anime... e.g. Naruto';
      document.getElementById('trending-title').textContent = '🔥 Top Anime Right Now';
    } else {
      document.getElementById('hero-title').textContent = 'Discover Trending Movies';
      document.getElementById('hero-sub').textContent = 'Search thousands of movies instantly';
      document.getElementById('search-input').placeholder = 'Search movies... e.g. Inception';
      document.getElementById('trending-title').textContent = '🔥 Trending Movies Right Now';
    }

    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('trending-section').classList.remove('hidden');
    document.getElementById('search-input').value = '';
    document.getElementById('genre-select').value = '';
    document.getElementById('year-select').value = '';
    currentGenre = '';
    currentYear = '';
    loadTrending();
  });
});

// Genre dropdown
document.getElementById('genre-select').addEventListener('change', () => {
  currentGenre = document.getElementById('genre-select').value;
  currentPage = 1;
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('trending-section').classList.remove('hidden');
  loadTrending();
});

// Year dropdown
document.getElementById('year-select').addEventListener('change', () => {
  currentYear = document.getElementById('year-select').value;
  currentPage = 1;
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('trending-section').classList.remove('hidden');
  loadTrending();
});

// Dark mode
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.getElementById('theme-toggle').textContent =
    document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Search button
document.getElementById('search-btn').addEventListener('click', () => search());

// Enter key
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') search();
});

// When search input is cleared go back to default
document.getElementById('search-input').addEventListener('input', () => {
  if (document.getElementById('search-input').value.trim() === '') {
    showDefault();
  }
});

// Search function
async function search() {
  const query = document.getElementById('search-input').value.trim();

  if (!query) {
    showDefault();
    return;
  }

  const trendingSection = document.getElementById('trending-section');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const resultsSection = document.getElementById('results-section');
  const resultsGrid = document.getElementById('results-grid');
  const resultsTitle = document.getElementById('results-title');

  trendingSection.classList.add('hidden');
  loadMoreBtn.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  resultsGrid.innerHTML = '<div class="spinner">Searching...</div>';
  resultsTitle.textContent = `Results for "${query}"`;

  if (currentTab === 'anime') {
    let url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=16`;
    if (currentYear) url += `&start_date=${currentYear}-01-01&end_date=${currentYear}-12-31`;
    const res = await fetch(url);
    const data = await res.json();
    renderAnimeCards(data.data, resultsGrid);
  } else {
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`;
    if (currentYear) url += `&year=${currentYear}`;
    const res = await fetch(url);
    const data = await res.json();
    renderMovieCards(data.results, resultsGrid);
  }
}

// Show default
function showDefault() {
  document.getElementById('trending-section').classList.remove('hidden');
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('search-input').value = '';
  currentPage = 1;
  loadTrending();
}

// Load trending
async function loadTrending(append = false) {
  const grid = document.getElementById('trending-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');

  if (!append) {
    grid.innerHTML = '<div class="spinner">Loading...</div>';
    currentPage = 1;
  }

  if (currentTab === 'anime') {
    let url = `https://api.jikan.moe/v4/top/anime?limit=16&page=${currentPage}`;
    if (currentGenre) {
      const animeGenreId = currentGenre.split('|')[1];
      url = `https://api.jikan.moe/v4/anime?genres=${animeGenreId}&order_by=score&sort=desc&limit=16&page=${currentPage}`;
    }
    if (currentYear) {
      url += `&start_date=${currentYear}-01-01&end_date=${currentYear}-12-31`;
    }
    const res = await fetch(url);
    const data = await res.json();

    if (!append) grid.innerHTML = '';
    renderAnimeCards(data.data, grid, append);

    if (data.pagination?.has_next_page) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  } else {
    let movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&sort_by=popularity.desc&page=${currentPage}`;
    if (currentGenre) {
      const movieGenreId = currentGenre.split('|')[0];
      movieUrl += `&with_genres=${movieGenreId}`;
    }
    if (currentYear) movieUrl += `&primary_release_year=${currentYear}`;
    const res = await fetch(movieUrl);
    const data = await res.json();

    if (!append) grid.innerHTML = '';
    renderMovieCards(data.results, grid, append);

    if (currentPage < data.total_pages) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  }
}

// Load more button
document.getElementById('load-more-btn').addEventListener('click', async () => {
  if (isLoadingMore) return;
  isLoadingMore = true;

  const btn = document.getElementById('load-more-btn');
  btn.textContent = 'Loading...';
  currentPage++;

  await loadTrending(true);

  btn.textContent = 'Load More';
  isLoadingMore = false;
});

// Render anime cards
function renderAnimeCards(items, container, append = false) {
  if (!append) container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = '<p class="spinner">No results found.</p>';
    return;
  }
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
  <img src="${item.images?.jpg?.image_url || ''}" alt="${item.title}" />
  <div class="card-overlay">
    <div class="overlay-title">${item.title}</div>
    <div class="overlay-rating">⭐ ${item.score || 'N/A'} &nbsp;|&nbsp; 📺 ${item.episodes || '?'} eps</div>
  </div>
  <div class="card-info">
    <div class="card-title">${item.title}</div>
    <div class="card-rating">⭐ ${item.score || 'N/A'}</div>
  </div>
`;
    card.addEventListener('click', () => openAnimeModal(item));
    container.appendChild(card);
  });
}

// Render movie cards
function renderMovieCards(items, container, append = false) {
  if (!append) container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = '<p class="spinner">No results found.</p>';
    return;
  }
  items.forEach(item => {
    if (!item.poster_path) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
  <img src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${item.title}" />
  <div class="card-overlay">
    <div class="overlay-title">${item.title}</div>
    <div class="overlay-rating">⭐ ${item.vote_average?.toFixed(1) || 'N/A'} &nbsp;|&nbsp; 📅 ${item.release_date?.slice(0, 4) || '?'}</div>
  </div>
  <div class="card-info">
    <div class="card-title">${item.title}</div>
    <div class="card-rating">⭐ ${item.vote_average?.toFixed(1) || 'N/A'}</div>
  </div>
`;
    card.addEventListener('click', () => openMovieModal(item));
    container.appendChild(card);
  });
}

// Open anime modal
function openAnimeModal(item) {
  const genres = item.genres?.map(g => `<span class="modal-tag">${g.name}</span>`).join('') || '';
  document.getElementById('modal-content').innerHTML = `
    <img src="${item.images?.jpg?.large_image_url || ''}" alt="${item.title}" />
    <div class="modal-details">
      <h2>${item.title}</h2>
      <div class="modal-rating">⭐ ${item.score || 'N/A'} &nbsp;|&nbsp; 📺 ${item.episodes || '?'} episodes</div>
      <div>${genres}</div>
      <p>${item.synopsis || 'No description available.'}</p>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('active');
}

// Open movie modal
function openMovieModal(item) {
  document.getElementById('modal-content').innerHTML = `
    <img src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${item.title}" />
    <div class="modal-details">
      <h2>${item.title}</h2>
      <div class="modal-rating">⭐ ${item.vote_average?.toFixed(1) || 'N/A'} &nbsp;|&nbsp; 📅 ${item.release_date?.slice(0, 4) || '?'}</div>
      <p>${item.overview || 'No description available.'}</p>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('active');
}

// Close modal
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// Load trending on start
loadTrending();