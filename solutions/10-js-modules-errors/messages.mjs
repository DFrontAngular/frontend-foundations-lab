import { DomainError } from './domain-error.mjs';

export function toUserMessage(error) {
  if (!(error instanceof DomainError)) return 'No se pudo completar la operacion. Intentalo de nuevo.';
  switch (error.code) {
    case 'PRODUCT_NOT_FOUND':
      return 'No encontramos ese producto.';
    case 'INVALID_PRODUCT':
      return 'Los datos recibidos no tienen el formato esperado.';
    default:
      return 'No se pudo completar la operacion.';
  }
}
