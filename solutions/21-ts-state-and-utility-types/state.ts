export interface Product {
  readonly id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  readonly createdAt: string;
}

export type ProductCreate = Omit<Product, 'id' | 'createdAt'>;
export type ProductPatch = Partial<ProductCreate>;
export type ProductCardView = Pick<Product, 'id' | 'name' | 'price' | 'stock'>;

export type LoadState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'empty' }
  | { readonly status: 'success'; readonly data: T };

export function mapState<T, R>(state: LoadState<T>, mapper: (value: T) => R): LoadState<R> {
  if (state.status === 'success') return { status: 'success', data: mapper(state.data) };
  return state;
}

function assertNever(value: never): never {
  throw new Error(`Estado no soportado: ${JSON.stringify(value)}`);
}

export function stateLabel<T>(state: LoadState<T>): string {
  switch (state.status) {
    case 'idle': return 'Inactivo';
    case 'loading': return 'Cargando';
    case 'error': return `Error: ${state.message}`;
    case 'empty': return 'Sin resultados';
    case 'success': return 'Completado';
    default: return assertNever(state);
  }
}
