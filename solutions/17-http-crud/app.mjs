const form = document.querySelector('[data-form]');
const tableBody = document.querySelector('[data-table-body]');
const formStatus = document.querySelector('[data-form-status]');
const listStatus = document.querySelector('[data-list-status]');
const submitButton = document.querySelector('[data-submit]');
const cancelButton = document.querySelector('[data-cancel]');
const formTitle = document.querySelector('[data-form-title]');
const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
let products = [];
let pendingDeleteId = null;

class ApiError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 204) return undefined;

  let body;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.message ?? `Error HTTP ${response.status}.`,
      body?.error?.details
    );
  }
  return body;
}

function clearFieldErrors() {
  for (const error of form.querySelectorAll('[data-error-for]')) error.textContent = '';
  for (const control of form.elements) control.removeAttribute?.('aria-invalid');
}

function showFieldErrors(details = {}) {
  for (const [field, message] of Object.entries(details)) {
    const control = form.elements.namedItem(field);
    const error = form.querySelector(`[data-error-for="${CSS.escape(field)}"]`);
    control?.setAttribute?.('aria-invalid', 'true');
    if (error) error.textContent = String(message);
  }
}

function createRow(product) {
  const row = document.createElement('tr');
  row.dataset.productId = product.id;

  const name = document.createElement('th');
  name.scope = 'row';
  name.textContent = product.name;
  const price = document.createElement('td');
  price.textContent = currency.format(product.price);
  const stock = document.createElement('td');
  stock.textContent = String(product.stock);
  const actions = document.createElement('td');
  const wrapper = document.createElement('div');
  wrapper.className = 'row-actions';

  const edit = document.createElement('button');
  edit.className = 'button button--secondary';
  edit.type = 'button';
  edit.dataset.action = 'edit';
  edit.textContent = 'Editar';

  const remove = document.createElement('button');
  remove.className = 'button button--danger';
  remove.type = 'button';
  remove.dataset.action = 'delete';
  remove.textContent = 'Eliminar';

  wrapper.append(edit, remove);
  actions.append(wrapper);
  row.append(name, price, stock, actions);
  return row;
}

function renderProducts() {
  tableBody.replaceChildren(...products.map(createRow));
}

async function loadProducts() {
  listStatus.dataset.kind = '';
  listStatus.textContent = 'Cargando productos...';
  try {
    const body = await requestJson('/api/products?limit=50&sort=name');
    products = body.items;
    renderProducts();
    listStatus.dataset.kind = 'success';
    listStatus.textContent = `${products.length} productos cargados.`;
  } catch (error) {
    listStatus.dataset.kind = 'error';
    listStatus.textContent = error instanceof Error ? error.message : 'No se pudo cargar.';
  }
}

function getDraft() {
  const data = new FormData(form);
  return {
    name: String(data.get('name') ?? '').trim(),
    category: String(data.get('category') ?? '').trim(),
    price: Number(data.get('price')),
    stock: Number(data.get('stock'))
  };
}

async function saveProduct(event) {
  event.preventDefault();
  clearFieldErrors();
  formStatus.textContent = '';

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = String(new FormData(form).get('id') ?? '');
  const editing = Boolean(id);
  submitButton.disabled = true;
  cancelButton.disabled = true;
  submitButton.textContent = 'Guardando...';

  try {
    const product = await requestJson(editing ? `/api/products/${encodeURIComponent(id)}` : '/api/products', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getDraft())
    });

    if (editing) {
      products = products.map((item) => item.id === product.id ? product : item);
    } else {
      products = [product, ...products];
    }
    renderProducts();
    cancelEdit();
    formStatus.dataset.kind = 'success';
    formStatus.textContent = editing ? 'Producto actualizado.' : 'Producto creado.';
  } catch (error) {
    formStatus.dataset.kind = 'error';
    formStatus.textContent = error instanceof Error ? error.message : 'No se pudo guardar.';
    if (error instanceof ApiError && error.status === 422) showFieldErrors(error.details);
  } finally {
    submitButton.disabled = false;
    cancelButton.disabled = false;
    submitButton.textContent = 'Guardar';
  }
}

function startEdit(product) {
  form.elements.id.value = product.id;
  form.elements.name.value = product.name;
  form.elements.category.value = product.category;
  form.elements.price.value = String(product.price);
  form.elements.stock.value = String(product.stock);
  formTitle.textContent = `Editar ${product.name}`;
  cancelButton.hidden = false;
  form.elements.name.focus();
}

function cancelEdit() {
  form.reset();
  form.elements.id.value = '';
  formTitle.textContent = 'Nuevo producto';
  cancelButton.hidden = true;
  clearFieldErrors();
}

async function deleteProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product || !window.confirm(`Eliminar ${product.name}?`)) return;
  pendingDeleteId = id;
  listStatus.textContent = `Eliminando ${product.name}...`;

  try {
    await requestJson(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    products = products.filter((item) => item.id !== id);
    renderProducts();
    listStatus.dataset.kind = 'success';
    listStatus.textContent = 'Producto eliminado.';
    if (form.elements.id.value === id) cancelEdit();
  } catch (error) {
    listStatus.dataset.kind = 'error';
    listStatus.textContent = error instanceof Error ? error.message : 'No se pudo eliminar.';
  } finally {
    pendingDeleteId = null;
  }
}

form.addEventListener('submit', saveProduct);
document.querySelector('[data-cancel]').addEventListener('click', cancelEdit);
document.querySelector('[data-refresh]').addEventListener('click', loadProducts);

tableBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || pendingDeleteId) return;
  const row = button.closest('[data-product-id]');
  const product = products.find((item) => item.id === row?.dataset.productId);
  if (!product) return;
  if (button.dataset.action === 'edit') startEdit(product);
  if (button.dataset.action === 'delete') deleteProduct(product.id);
});

loadProducts();
