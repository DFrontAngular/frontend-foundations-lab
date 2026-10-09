const favoritesKey = 'frontend-foundations-capstone-favorites-v1';

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function readFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  const sort = ['name', 'price', 'stock', 'rating'].includes(params.get('sort')) ? params.get('sort') : 'name';
  return {
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    sort,
    order: params.get('order') === 'desc' ? 'desc' : 'asc',
    page: positiveInteger(params.get('page'), 1),
    limit: 8
  };
}

export function writeFiltersToUrl(filters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.sort !== 'name') params.set('sort', filters.sort);
  if (filters.order !== 'asc') params.set('order', filters.order);
  if (filters.page > 1) params.set('page', String(filters.page));
  const url = `${location.pathname}${params.size ? `?${params}` : ''}`;
  history.replaceState(null, '', url);
}

export function readFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(favoritesKey) ?? '[]');
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) return new Set();
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function writeFavorites(favorites) {
  localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
}

export function debounce(callback, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}
