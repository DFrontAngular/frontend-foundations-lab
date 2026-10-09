export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

export interface Product {
  readonly id: string;
  name: string;
  price: number;
  stock: number;
  status: ProductStatus;
  readonly createdAt: string;
}

export type ProductDraft = Omit<Product, 'id' | 'createdAt'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isProductStatus(value: unknown): value is ProductStatus {
  return value === 'ACTIVE' || value === 'INACTIVE' || value === 'DISCONTINUED';
}

export function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.price === 'number'
    && Number.isFinite(value.price)
    && typeof value.stock === 'number'
    && Number.isInteger(value.stock)
    && isProductStatus(value.status)
    && typeof value.createdAt === 'string';
}

function assertNever(value: never): never {
  throw new Error(`Estado no soportado: ${String(value)}`);
}

export function formatProductStatus(status: ProductStatus): string {
  switch (status) {
    case 'ACTIVE': return 'Activo';
    case 'INACTIVE': return 'Inactivo';
    case 'DISCONTINUED': return 'Descatalogado';
    default: return assertNever(status);
  }
}
