export class ApiError extends Error {
  constructor(status, message, details = undefined, options = undefined) {
    super(message, options);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 204) return undefined;

  let body;
  try {
    body = await response.json();
  } catch (error) {
    if (!response.ok) throw new ApiError(response.status, `Error HTTP ${response.status}.`, undefined, { cause: error });
    throw new ApiError(response.status, 'La API no devolvio JSON valido.', undefined, { cause: error });
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

export function getProducts(filters, { signal } = {}) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sort: filters.sort,
    order: filters.order,
    delay: '250'
  });
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  return requestJson(`/api/products?${params}`, { signal });
}

export function getCategories() {
  return requestJson('/api/categories');
}

export function createProduct(draft) {
  return requestJson('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft)
  });
}

export function updateProduct(id, patch) {
  return requestJson(`/api/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  });
}

export function deleteProduct(id) {
  return requestJson(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
