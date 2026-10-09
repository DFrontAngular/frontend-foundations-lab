import {
  ApiError,
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct
} from './api.mjs';
import {
  debounce,
  readFavorites,
  readFiltersFromUrl,
  writeFavorites,
  writeFiltersToUrl
} from './state.mjs';
import {
  clearProductFormErrors,
  fillProductForm,
  renderCatalog,
  showProductFormErrors
} from './views.mjs';

const state = {
  filters: readFiltersFromUrl(),
  favorites: readFavorites(),
  products: { status: 'idle' },
  categories: []
};

const elements = {
  filters: document.querySelector('[data-filters]'),
  products: document.querySelector('[data-products]'),
  state: document.querySelector('[data-state]'),
  summary: document.querySelector('[data-summary]'),
  pagination: document.querySelector('[data-pagination]'),
  pageLabel: document.querySelector('[data-page-label]'),
  dialog: document.querySelector('[data-product-dialog]'),
  productForm: document.querySelector('[data-product-form]'),
  dialogTitle: document.querySelector('[data-dialog-title]'),
  dialogEyebrow: document.querySelector('[data-dialog-eyebrow]'),
  dialogStatus: document.querySelector('[data-dialog-status]'),
  saveButton: document.querySelector('[data-save-product]'),
  toast: document.querySelector('[data-toast]')
};

let activeCatalogController;
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => {
    elements.toast.hidden = true;
  }, 3500);
}

function hydrateFilters() {
  elements.filters.elements.search.value = state.filters.search;
  elements.filters.elements.category.value = state.filters.category;
  elements.filters.elements.sort.value = state.filters.sort;
  elements.filters.elements.order.value = state.filters.order;
}

function readFiltersFromForm() {
  const data = new FormData(elements.filters);
  return {
    ...state.filters,
    search: String(data.get('search') ?? '').trim(),
    category: String(data.get('category') ?? ''),
    sort: String(data.get('sort') ?? 'name'),
    order: String(data.get('order') ?? 'asc'),
    page: 1
  };
}

async function loadCatalog() {
  activeCatalogController?.abort();
  const controller = new AbortController();
  activeCatalogController = controller;
  state.products = { status: 'loading' };
  renderCatalog(elements, state);
  writeFiltersToUrl(state.filters);

  try {
    const body = await getProducts(state.filters, { signal: controller.signal });
    state.filters.page = body.meta.page;
    state.products = body.items.length === 0
      ? { status: 'empty' }
      : { status: 'success', items: body.items, meta: body.meta };
    renderCatalog(elements, state);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    state.products = { status: 'error', message: error instanceof Error ? error.message : 'Error desconocido.' };
    renderCatalog(elements, state);
  } finally {
    if (activeCatalogController === controller) activeCatalogController = undefined;
  }
}

async function loadCategories() {
  try {
    const body = await getCategories();
    state.categories = body.items;
    for (const category of state.categories) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      elements.filters.elements.category.append(option);
    }
    hydrateFilters();
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'No se cargaron las categorias.');
  }
}

function findVisibleProduct(id) {
  return state.products.status === 'success'
    ? state.products.items.find((product) => product.id === id)
    : undefined;
}

function openProductDialog(product = undefined) {
  clearProductFormErrors(elements.productForm);
  fillProductForm(elements.productForm, product);
  elements.dialogTitle.textContent = product ? `Editar ${product.name}` : 'Nuevo producto';
  elements.dialogEyebrow.textContent = product ? 'Edicion' : 'Alta';
  elements.dialogStatus.textContent = '';
  elements.dialog.showModal();
  elements.productForm.elements.name.focus();
}

function closeProductDialog() {
  if (!elements.saveButton.disabled) elements.dialog.close();
}

function productDraftFromForm() {
  const data = new FormData(elements.productForm);
  return {
    name: String(data.get('name') ?? '').trim(),
    category: String(data.get('category') ?? '').trim(),
    price: Number(data.get('price')),
    stock: Number(data.get('stock')),
    rating: Number(data.get('rating')),
    description: String(data.get('description') ?? '').trim(),
    featured: data.has('featured')
  };
}

async function saveProduct(event) {
  event.preventDefault();
  clearProductFormErrors(elements.productForm);
  elements.dialogStatus.textContent = '';

  if (!elements.productForm.checkValidity()) {
    elements.productForm.reportValidity();
    return;
  }

  const id = String(new FormData(elements.productForm).get('id') ?? '');
  const editing = Boolean(id);
  elements.saveButton.disabled = true;
  elements.saveButton.textContent = 'Guardando...';

  try {
    const product = editing
      ? await updateProduct(id, productDraftFromForm())
      : await createProduct(productDraftFromForm());
    elements.dialog.close();
    showToast(editing ? 'Producto actualizado.' : 'Producto creado.');
    if (!editing) state.filters.page = 1;
    await loadCatalog();
    return product;
  } catch (error) {
    elements.dialogStatus.dataset.kind = 'error';
    elements.dialogStatus.textContent = error instanceof Error ? error.message : 'No se pudo guardar.';
    if (error instanceof ApiError && error.status === 422) {
      showProductFormErrors(elements.productForm, error.details);
      const firstField = Object.keys(error.details ?? {})[0];
      elements.productForm.elements.namedItem(firstField)?.focus?.();
    }
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = 'Guardar producto';
  }
}

async function removeProduct(product) {
  if (!window.confirm(`Eliminar ${product.name}?`)) return;
  try {
    await deleteProduct(product.id);
    state.favorites.delete(product.id);
    writeFavorites(state.favorites);
    showToast('Producto eliminado.');
    await loadCatalog();
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'No se pudo eliminar.');
  }
}

function toggleFavorite(product) {
  if (state.favorites.has(product.id)) state.favorites.delete(product.id);
  else state.favorites.add(product.id);
  writeFavorites(state.favorites);
  renderCatalog(elements, state);
}

const debouncedFilterLoad = debounce(() => {
  state.filters = readFiltersFromForm();
  loadCatalog();
}, 300);

elements.filters.addEventListener('input', (event) => {
  if (event.target.name === 'search') debouncedFilterLoad();
  else {
    state.filters = readFiltersFromForm();
    loadCatalog();
  }
});

elements.filters.addEventListener('reset', () => {
  setTimeout(() => {
    state.filters = { search: '', category: '', sort: 'name', order: 'asc', page: 1, limit: 8 };
    hydrateFilters();
    loadCatalog();
  });
});

elements.products.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  const card = button?.closest('[data-product-id]');
  if (!button || !card) return;
  const product = findVisibleProduct(card.dataset.productId);
  if (!product) return;
  if (button.dataset.action === 'favorite') toggleFavorite(product);
  if (button.dataset.action === 'edit') openProductDialog(product);
  if (button.dataset.action === 'delete') removeProduct(product);
});

elements.state.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="retry"]')) loadCatalog();
});

elements.pagination.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page-action]');
  if (!button || state.products.status !== 'success') return;
  state.filters.page += button.dataset.pageAction === 'next' ? 1 : -1;
  loadCatalog();
  document.querySelector('#results-title').focus?.();
});

document.querySelector('[data-new-product]').addEventListener('click', () => openProductDialog());
for (const closeButton of document.querySelectorAll('[data-close-dialog]')) {
  closeButton.addEventListener('click', closeProductDialog);
}
elements.productForm.addEventListener('submit', saveProduct);
elements.productForm.addEventListener('input', (event) => {
  const control = event.target;
  if (!control.name) return;
  control.removeAttribute('aria-invalid');
  const error = elements.productForm.querySelector(`[data-error-for="${CSS.escape(control.name)}"]`);
  if (error) error.textContent = '';
});

elements.dialog.addEventListener('cancel', (event) => {
  if (elements.saveButton.disabled) event.preventDefault();
});

window.addEventListener('popstate', () => {
  state.filters = readFiltersFromUrl();
  hydrateFilters();
  loadCatalog();
});

async function initialize() {
  hydrateFilters();
  renderCatalog(elements, state);
  await loadCategories();
  await loadCatalog();
}

initialize();
