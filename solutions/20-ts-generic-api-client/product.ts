import { parsePage, requestJson, type Page, type Parser } from './api-client.js';

export interface Product {
  readonly id: string;
  name: string;
  price: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const parseProduct: Parser<Product> = (value) => {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.name !== 'string'
    || typeof value.price !== 'number'
    || !Number.isFinite(value.price)) {
    throw new TypeError('Producto invalido.');
  }
  return { id: value.id, name: value.name, price: value.price };
};

export function getProducts(fetcher: typeof fetch = fetch): Promise<Page<Product>> {
  return requestJson('/api/products', {
    parser: parsePage(parseProduct),
    fetcher
  });
}
