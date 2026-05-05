const BASE_URL = 'http://localhost:4000';

const searchInput = document.getElementById('searchInput');
const messageEl    = document.getElementById('message');
const articlesEl   = document.getElementById('articles');
const overlay      = document.getElementById('resultsOverlay');
const closeBtn     = document.getElementById('closeResults');


const FASHION_BOOST  = ['fashion', 'outfit', 'style', 'clothing', 'wear', 'apparel', 'designer', 'collection', 'trend', 'runway'];

const NOISE_KEYWORDS = ['politics', 'stock market', 'cryptocurrency', 'bitcoin', 'sports', 'football', 'basketball', 'war', 'election', 'weather'];

function buildQuery(userQuery) {
  const fashionClause = FASHION_BOOST.join(' OR ');
  return `(${userQuery}) AND (${fashionClause})`;
}

function isFashionArticle(article) {
  const text = `${article.title ?? ''} ${article.description ?? ''}`.toLowerCase();
  if (NOISE_KEYWORDS.some(kw => text.includes(kw))) return false;
  return FASHION_BOOST.some(kw => text.includes(kw));
}

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') performSearch();
});

async function performSearch() {
  const raw = searchInput.value.trim();
  if (!raw) return;

  articlesEl.innerHTML = '';
  messageEl.textContent = 'Curating your look…';
  overlay.classList.add('active');

  try {
    const q        = encodeURIComponent(buildQuery(raw));
    const url      = `${BASE_URL}/v2/everything?q=${q}&language=en&sortBy=relevancy&pageSize=30`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data     = await response.json();
    const filtered = (data.articles ?? []).filter(isFashionArticle);

    displayResults(filtered);
  } catch (err) {
    messageEl.textContent = 'Error connecting to API.';
    console.error(err);
  }
}

closeBtn.addEventListener('click', () => overlay.classList.remove('active'));

function displayResults(items) {
  messageEl.textContent = '';

  if (!items.length) {
    messageEl.textContent = 'No fashion results found — try a different vibe.';
    return;
  }

  articlesEl.innerHTML = items.map(item => {
    const image = item.urlToImage
      ? `<div class="card-image" style="background-image:url('${item.urlToImage}')"></div>`
      : `<div class="card-image card-image--empty"></div>`;

    const source = item.source?.name ?? '';
    const date   = item.publishedAt
      ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

    return `
      <div class="result-card">
        ${image}
        <div class="card-body">
          <div class="card-meta">
            ${source ? `<span class="card-source">${source}</span>` : ''}
            ${date   ? `<span class="card-date">${date}</span>`   : ''}
          </div>
          <a class="card-title" href="${item.url}" target="_blank" rel="noopener noreferrer">
            ${item.title ?? 'No title'}
          </a>
          ${item.description ? `<p class="card-desc">${item.description}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');
}