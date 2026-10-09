const products = [
  { name: 'Teclado', category: 'Perifericos', price: 89.9 },
  { name: 'Raton', category: 'Perifericos', price: 54.5 },
  { name: 'Monitor 27', category: 'Monitores', price: 289 },
  { name: 'Monitor portatil', category: 'Monitores', price: 169.99 }
];

const storageKey = 'frontend-foundations-view-v1';
const form = document.querySelector('[data-filters]');
const results = document.querySelector('[data-results]');
const status = document.querySelector('[data-status]');
const viewControls = [...document.querySelectorAll('input[name="view"]')];
const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function readFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  return {
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    sort: params.get('sort') === 'price' ? 'price' : 'name'
  };
}

function writeFiltersToUrl(filters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.sort !== 'name') params.set('sort', filters.sort);
  const nextUrl = `${location.pathname}${params.size ? `?${params}` : ''}`;
  history.replaceState(null, '', nextUrl);
}

function readViewPreference() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    return parsed === 'list' || parsed === 'grid' ? parsed : 'grid';
  } catch {
    return 'grid';
  }
}

function writeViewPreference(view) {
  localStorage.setItem(storageKey, JSON.stringify(view));
}

function getFormFilters() {
  const data = new FormData(form);
  return {
    search: String(data.get('search') ?? '').trim(),
    category: String(data.get('category') ?? ''),
    sort: String(data.get('sort') ?? 'name')
  };
}

function createResult(product) {
  const article = document.createElement('article');
  article.className = 'result-item';
  const title = document.createElement('h2');
  title.textContent = product.name;
  const meta = document.createElement('p');
  meta.textContent = `${product.category} · ${currency.format(product.price)}`;
  article.append(title, meta);
  return article;
}

function render() {
  const filters = getFormFilters();
  const view = viewControls.find((control) => control.checked)?.value ?? 'grid';
  writeFiltersToUrl(filters);
  writeViewPreference(view);

  const query = filters.search.toLocaleLowerCase('es');
  const filtered = products
    .filter((product) => (!query || product.name.toLocaleLowerCase('es').includes(query))
      && (!filters.category || product.category === filters.category))
    .toSorted((a, b) => filters.sort === 'price'
      ? a.price - b.price
      : a.name.localeCompare(b.name, 'es'));

  results.dataset.view = view;
  results.replaceChildren(...filtered.map(createResult));
  status.textContent = `${filtered.length} resultados. URL actualizada.`;
}

const initialFilters = readFiltersFromUrl();
form.elements.search.value = initialFilters.search;
form.elements.category.value = initialFilters.category;
form.elements.sort.value = initialFilters.sort;
const initialView = readViewPreference();
const selectedView = viewControls.find((control) => control.value === initialView) ?? viewControls[0];
selectedView.checked = true;

form.addEventListener('input', render);
form.addEventListener('reset', () => {
  setTimeout(() => {
    form.elements.sort.value = 'name';
    render();
  });
});
viewControls.forEach((control) => control.addEventListener('change', render));
render();
