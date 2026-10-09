const productsContainer = document.querySelector('[data-products]');
const listStatus = document.querySelector('[data-list-status]');
const formStatus = document.querySelector('[data-form-status]');
const search = document.querySelector('[data-search]');
const form = document.querySelector('[data-form]');
const submit = form.querySelector('button[type="submit"]');
const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
let products = [];

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? `Error ${response.status}.`);
  return body;
}

function createCard(product) {
  const article = document.createElement('article');
  article.className = 'product';
  const title = document.createElement('h3');
  title.textContent = product.name;
  const meta = document.createElement('p');
  meta.textContent = `${product.category} · ${currency.format(product.price)} · stock ${product.stock}`;
  article.append(title, meta);
  return article;
}

function renderProducts() {
  const query = search.value.trim().toLocaleLowerCase('es');
  const filtered = products.filter((product) => product.name.toLocaleLowerCase('es').includes(query));
  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No hay productos para este filtro.';
    productsContainer.replaceChildren(empty);
    return;
  }
  productsContainer.replaceChildren(...filtered.map(createCard));
}

async function loadProducts() {
  listStatus.textContent = 'Cargando productos...';
  try {
    const body = await requestJson('/api/products?limit=10');
    products = body.items;
    renderProducts();
    listStatus.textContent = `${products.length} productos cargados.`;
  } catch (error) {
    listStatus.dataset.kind = 'error';
    listStatus.textContent = error instanceof Error ? error.message : 'No se pudo cargar.';
  }
}

async function createProduct(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const draft = {
    name: String(data.get('name') ?? '').trim(),
    category: String(data.get('category') ?? '').trim(),
    price: Number(data.get('price')),
    stock: Number(data.get('stock'))
  };
  submit.disabled = true;
  formStatus.textContent = 'Creando producto...';
  try {
    const product = await requestJson('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft)
    });
    products = [product, ...products];
    form.reset();
    renderProducts();
    formStatus.dataset.kind = 'success';
    formStatus.textContent = `Producto creado: ${product.name}.`;
    form.elements.name.focus();
  } catch (error) {
    formStatus.dataset.kind = 'error';
    formStatus.textContent = error instanceof Error ? error.message : 'No se pudo crear.';
  } finally {
    submit.disabled = false;
  }
}

search.addEventListener('input', renderProducts);
form.addEventListener('submit', createProduct);
loadProducts();
