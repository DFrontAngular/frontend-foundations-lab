export type Parser<T> = (value: unknown) => T;

export interface Page<T> {
  readonly items: readonly T[];
  readonly meta: {
    readonly page: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${field} debe ser numerico.`);
  }
  return value;
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  options: { parser: Parser<T>; init?: RequestInit; fetcher?: typeof fetch }
): Promise<T> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(input, options.init);
  if (!response.ok) {
    throw new ApiError(response.status, `La peticion respondio con ${response.status}.`);
  }
  const raw: unknown = await response.json();
  try {
    return options.parser(raw);
  } catch (error) {
    throw new ApiError(response.status, 'La respuesta no cumple el contrato esperado.', { cause: error });
  }
}

export function parsePage<T>(itemParser: Parser<T>): Parser<Page<T>> {
  return (value: unknown): Page<T> => {
    if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta)) {
      throw new TypeError('La respuesta no es una pagina valida.');
    }
    return {
      items: value.items.map(itemParser),
      meta: {
        page: parseNumber(value.meta.page, 'meta.page'),
        total: parseNumber(value.meta.total, 'meta.total'),
        totalPages: parseNumber(value.meta.totalPages, 'meta.totalPages')
      }
    };
  };
}
