import { DomainError } from './domain-error.mjs';

export function parseProduct(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new DomainError('INVALID_PRODUCT', 'La respuesta no contiene un producto.', { details: { value } });
  }
  const { id, name, price } = value;
  if (typeof id !== 'string' || typeof name !== 'string' || typeof price !== 'number' || !Number.isFinite(price)) {
    throw new DomainError('INVALID_PRODUCT', 'La respuesta del producto no cumple el contrato.', {
      details: { receivedKeys: Object.keys(value) }
    });
  }
  return { id, name, price };
}

export function findProductOrThrow(products, id) {
  const product = products.find((item) => item.id === id);
  if (!product) {
    throw new DomainError('PRODUCT_NOT_FOUND', 'No existe el producto solicitado.', { details: { id } });
  }
  return product;
}
