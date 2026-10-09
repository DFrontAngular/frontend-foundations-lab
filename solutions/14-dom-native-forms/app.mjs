const form = document.querySelector('[data-form]');
const list = document.querySelector('[data-list]');
const status = document.querySelector('[data-status]');
let products = [];

function isFormControl(element) {
  return element instanceof HTMLInputElement
    || element instanceof HTMLSelectElement
    || element instanceof HTMLTextAreaElement;
}

function clearErrors() {
  for (const control of form.elements) {
    if (!isFormControl(control) || !control.name) continue;
    control.removeAttribute('aria-invalid');
    const error = form.querySelector(`[data-error-for="${CSS.escape(control.name)}"]`);
    if (error) error.textContent = '';
  }
}

function showValidationErrors() {
  let firstInvalid = null;
  for (const control of form.elements) {
    if (!isFormControl(control) || !control.name || control.validity.valid) continue;
    firstInvalid ??= control;
    control.setAttribute('aria-invalid', 'true');
    const error = form.querySelector(`[data-error-for="${CSS.escape(control.name)}"]`);
    if (error) error.textContent = control.validationMessage;
  }
  return firstInvalid;
}

function toProductDraft(formData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    category: String(formData.get('category') ?? ''),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    featured: formData.has('featured')
  };
}

function render() {
  list.replaceChildren(...products.map((product) => {
    const item = document.createElement('li');
    item.textContent = `${product.name} · ${product.category} · ${product.price.toFixed(2)} € · stock ${product.stock}${product.featured ? ' · destacado' : ''}`;
    return item;
  }));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();

  if (!form.checkValidity()) {
    const firstInvalid = showValidationErrors();
    status.dataset.kind = 'error';
    status.textContent = 'Revisa los campos marcados.';
    firstInvalid?.focus();
    return;
  }

  const product = { id: crypto.randomUUID(), ...toProductDraft(new FormData(form)) };
  products = [...products, product];
  render();
  form.reset();
  status.dataset.kind = 'success';
  status.textContent = `Producto añadido: ${product.name}.`;
  form.elements.name.focus();
});

form.addEventListener('input', (event) => {
  const control = event.target;
  if (!isFormControl(control) || !control.name) return;
  control.removeAttribute('aria-invalid');
  const error = form.querySelector(`[data-error-for="${CSS.escape(control.name)}"]`);
  if (error) error.textContent = '';
});
