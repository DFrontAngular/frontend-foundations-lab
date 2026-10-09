const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function createStateCard(title, description, { retry = false, loading = false } = {}) {
  const card = document.createElement('div');
  card.className = 'state-card';
  if (loading) {
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    card.append(spinner);
  }
  const heading = document.createElement('h3');
  heading.textContent = title;
  const text = document.createElement('p');
  text.textContent = description;
  card.append(heading, text);
  if (retry) {
    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'button';
    button.dataset.action = 'retry';
    button.textContent = 'Reintentar';
    card.append(button);
  }
  return card;
}

function createProductCard(product, favorite) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.dataset.productId = product.id;
  article.dataset.featured = String(product.featured);

  const header = document.createElement('div');
  header.className = 'product-card__header';
  const headingGroup = document.createElement('div');
  const category = document.createElement('p');
  category.className = 'product-card__category';
  category.textContent = product.category;
  const title = document.createElement('h3');
  title.textContent = product.name;
  headingGroup.append(category, title);

  const favoriteButton = document.createElement('button');
  favoriteButton.className = 'button button--secondary favorite-button';
  favoriteButton.type = 'button';
  favoriteButton.dataset.action = 'favorite';
  favoriteButton.setAttribute('aria-pressed', String(favorite));
  favoriteButton.setAttribute('aria-label', favorite ? `Quitar ${product.name} de favoritos` : `Añadir ${product.name} a favoritos`);
  favoriteButton.textContent = favorite ? '★' : '☆';
  header.append(headingGroup, favoriteButton);

  const description = document.createElement('p');
  description.className = 'product-card__description';
  description.textContent = product.description || 'Sin descripcion.';

  const meta = document.createElement('div');
  meta.className = 'product-card__meta';
  const price = document.createElement('span');
  price.className = 'product-card__price';
  price.textContent = currency.format(product.price);
  const stock = document.createElement('span');
  stock.className = 'product-card__stock';
  stock.dataset.low = String(product.stock <= 3);
  stock.textContent = product.stock === 0 ? 'Agotado' : `${product.stock} uds.`;
  meta.append(price, stock);

  const actions = document.createElement('div');
  actions.className = 'product-card__actions';
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
  actions.append(edit, remove);

  article.append(header, description, meta, actions);
  return article;
}

export function renderCatalog(elements, state) {
  const productsState = state.products;
  elements.products.replaceChildren();
  elements.state.replaceChildren();
  elements.pagination.hidden = true;
  elements.summary.textContent = '';

  if (productsState.status === 'idle') {
    elements.state.append(createStateCard('Catalogo preparado', 'Los productos se cargaran al iniciar.'));
    return;
  }
  if (productsState.status === 'loading') {
    elements.state.append(createStateCard('Cargando catalogo', 'Consultando la API local.', { loading: true }));
    return;
  }
  if (productsState.status === 'error') {
    elements.state.append(createStateCard('No se pudo cargar', productsState.message, { retry: true }));
    return;
  }
  if (productsState.status === 'empty') {
    elements.state.append(createStateCard('Sin resultados', 'Prueba a cambiar o limpiar los filtros.'));
    elements.summary.textContent = '0 productos';
    return;
  }
  if (productsState.status !== 'success') throw new Error(`Estado desconocido: ${productsState.status}`);

  elements.products.replaceChildren(...productsState.items.map((product) =>
    createProductCard(product, state.favorites.has(product.id))
  ));
  elements.summary.textContent = `${productsState.meta.total} productos`;
  elements.pagination.hidden = productsState.meta.totalPages <= 1;
  elements.pageLabel.textContent = `Pagina ${productsState.meta.page} de ${productsState.meta.totalPages}`;
  const previous = elements.pagination.querySelector('[data-page-action="previous"]');
  const next = elements.pagination.querySelector('[data-page-action="next"]');
  previous.disabled = productsState.meta.page <= 1;
  next.disabled = productsState.meta.page >= productsState.meta.totalPages;
}

export function fillProductForm(form, product = undefined) {
  form.reset();
  form.elements.id.value = product?.id ?? '';
  form.elements.name.value = product?.name ?? '';
  form.elements.category.value = product?.category ?? '';
  form.elements.price.value = product ? String(product.price) : '';
  form.elements.stock.value = product ? String(product.stock) : '';
  form.elements.rating.value = product ? String(product.rating) : '0';
  form.elements.description.value = product?.description ?? '';
  form.elements.featured.checked = product?.featured ?? false;
}

export function clearProductFormErrors(form) {
  for (const error of form.querySelectorAll('[data-error-for]')) error.textContent = '';
  for (const control of form.elements) control.removeAttribute?.('aria-invalid');
}

export function showProductFormErrors(form, details = {}) {
  for (const [field, message] of Object.entries(details)) {
    const control = form.elements.namedItem(field);
    const error = form.querySelector(`[data-error-for="${CSS.escape(field)}"]`);
    control?.setAttribute?.('aria-invalid', 'true');
    if (error) error.textContent = String(message);
  }
}
