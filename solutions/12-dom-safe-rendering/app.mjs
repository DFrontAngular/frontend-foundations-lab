const products = [
  { id: '1', name: 'Teclado mecanico', category: 'Perifericos', price: 89.9, stock: 18 },
  { id: '2', name: 'Monitor 27 pulgadas', category: 'Monitores', price: 289, stock: 2 },
  { id: '3', name: 'Hub USB-C', category: 'Conectividad', price: 64.95, stock: 0 }
];

const container = document.querySelector('[data-products]');
const status = document.querySelector('[data-status]');
const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

export function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.dataset.productId = product.id;

  const category = document.createElement('p');
  category.className = 'exercise-module';
  category.textContent = product.category;

  const title = document.createElement('h2');
  title.textContent = product.name;

  const meta = document.createElement('div');
  meta.className = 'product-card__meta';
  const price = document.createElement('strong');
  price.textContent = currency.format(product.price);
  const stock = document.createElement('span');
  stock.textContent = `${product.stock} unidades`;
  meta.append(price, stock);

  article.append(category, title, meta);

  if (product.stock <= 2) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = product.stock === 0 ? 'Agotado' : 'Stock bajo';
    article.append(badge);
  }

  return article;
}

export function renderProducts(target, items) {
  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No hay productos que mostrar.';
    target.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const item of items) fragment.append(createProductCard(item));
  target.replaceChildren(fragment);
}

document.querySelector('[data-load]').addEventListener('click', () => {
  renderProducts(container, products);
  status.textContent = 'Productos renderizados.';
});

document.querySelector('[data-empty]').addEventListener('click', () => {
  renderProducts(container, []);
  status.textContent = 'Resultado vacio.';
});

document.querySelector('[data-untrusted]').addEventListener('click', () => {
  renderProducts(container, [{ id: 'x', name: '<img src=x onerror=alert(1)>', category: 'Demo', price: 1, stock: 1 }]);
  status.textContent = 'El contenido aparece como texto literal.';
});

renderProducts(container, products);
