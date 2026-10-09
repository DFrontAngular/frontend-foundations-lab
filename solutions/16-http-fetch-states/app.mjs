const stateContainer = document.querySelector('[data-state]');
const loadButton = document.querySelector('[data-load]');
const scenarioSelect = document.querySelector('[data-scenario]');
const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
let lastScenario = 'success';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function fetchProducts(url) {
  const response = await fetch(url);
  if (!response.ok) {
    let message = `La API respondio con ${response.status}.`;
    try {
      const body = await response.json();
      message = body?.error?.message ?? message;
    } catch {
      // Conserva el mensaje HTTP cuando el cuerpo no es JSON.
    }
    throw new HttpError(response.status, message);
  }

  const body = await response.json();
  if (!body || !Array.isArray(body.items)) {
    throw new TypeError('La respuesta no contiene un listado valido.');
  }
  return body.items;
}

function createMessage(title, description, { retry = false, loading = false } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'state-message';
  if (loading) {
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    wrapper.append(spinner);
  }
  const heading = document.createElement('h2');
  heading.textContent = title;
  const text = document.createElement('p');
  text.textContent = description;
  wrapper.append(heading, text);
  if (retry) {
    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'button';
    button.textContent = 'Reintentar';
    button.addEventListener('click', load);
    wrapper.append(button);
  }
  return wrapper;
}

function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card';
  const title = document.createElement('h2');
  title.textContent = product.name;
  const meta = document.createElement('p');
  meta.textContent = `${product.category} · ${currency.format(product.price)}`;
  article.append(title, meta);
  return article;
}

function renderState(state) {
  switch (state.status) {
    case 'idle':
      stateContainer.replaceChildren(createMessage('Prepara un escenario', 'Selecciona una opcion y pulsa Cargar.'));
      break;
    case 'loading':
      stateContainer.replaceChildren(createMessage('Cargando productos', 'La peticion esta en curso.', { loading: true }));
      break;
    case 'error':
      stateContainer.replaceChildren(createMessage('No se pudo cargar', state.message, { retry: true }));
      break;
    case 'empty':
      stateContainer.replaceChildren(createMessage('Sin resultados', 'No hay productos para los filtros actuales.'));
      break;
    case 'success': {
      const list = document.createElement('div');
      list.className = 'product-list';
      list.replaceChildren(...state.items.map(createProductCard));
      stateContainer.replaceChildren(list);
      break;
    }
    default:
      throw new Error(`Estado no soportado: ${state.status}`);
  }
}

function scenarioUrl(scenario) {
  const urls = {
    success: '/api/products?limit=6',
    empty: '/api/products?search=resultado-imposible',
    error: '/api/products?status=500',
    slow: '/api/products?limit=6&delay=1500'
  };
  return urls[scenario] ?? urls.success;
}

async function load() {
  lastScenario = scenarioSelect.value || lastScenario;
  loadButton.disabled = true;
  scenarioSelect.disabled = true;
  renderState({ status: 'loading' });

  try {
    const items = await fetchProducts(scenarioUrl(lastScenario));
    renderState(items.length === 0 ? { status: 'empty' } : { status: 'success', items });
  } catch (error) {
    renderState({ status: 'error', message: error instanceof Error ? error.message : 'Error desconocido.' });
  } finally {
    loadButton.disabled = false;
    scenarioSelect.disabled = false;
  }
}

loadButton.addEventListener('click', load);
renderState({ status: 'idle' });
