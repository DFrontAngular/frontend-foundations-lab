const searchInput = document.querySelector('[data-search]');
const searchStatus = document.querySelector('[data-search-status]');
const results = document.querySelector('[data-results]');
const uploadForm = document.querySelector('[data-upload-form]');
const uploadStatus = document.querySelector('[data-upload-status]');
const uploadButton = document.querySelector('[data-upload-button]');
let activeSearchController;

function debounce(callback, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function renderResults(items) {
  results.replaceChildren(...items.map((product) => {
    const item = document.createElement('li');
    item.textContent = `${product.name} · ${product.category}`;
    return item;
  }));
}

async function searchProducts(query) {
  activeSearchController?.abort();
  const controller = new AbortController();
  activeSearchController = controller;
  searchStatus.dataset.kind = '';
  searchStatus.textContent = 'Buscando...';

  try {
    const params = new URLSearchParams({ search: query.trim(), limit: '8', delay: '700' });
    const response = await fetch(`/api/products?${params}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`La busqueda respondio con ${response.status}.`);
    const body = await response.json();
    renderResults(body.items);
    searchStatus.dataset.kind = 'success';
    searchStatus.textContent = `${body.meta.total} resultados para "${query.trim()}".`;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    searchStatus.dataset.kind = 'error';
    searchStatus.textContent = error instanceof Error ? error.message : 'No se pudo buscar.';
  } finally {
    if (activeSearchController === controller) activeSearchController = undefined;
  }
}

async function uploadFile(event) {
  event.preventDefault();
  if (!uploadForm.reportValidity()) return;
  uploadButton.disabled = true;
  uploadStatus.dataset.kind = '';
  uploadStatus.textContent = 'Subiendo archivo...';

  try {
    const formData = new FormData(uploadForm);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? `Error ${response.status}.`);
    uploadStatus.dataset.kind = 'success';
    uploadStatus.textContent = `Archivo recibido: ${body.receivedBytes} bytes.`;
    uploadForm.reset();
  } catch (error) {
    uploadStatus.dataset.kind = 'error';
    uploadStatus.textContent = error instanceof Error ? error.message : 'No se pudo subir.';
  } finally {
    uploadButton.disabled = false;
  }
}

const debouncedSearch = debounce(searchProducts, 300);
searchInput.addEventListener('input', () => debouncedSearch(searchInput.value));
uploadForm.addEventListener('submit', uploadFile);
searchProducts('');
