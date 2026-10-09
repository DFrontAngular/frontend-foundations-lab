export class StockError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'StockError';
    this.code = 'STOCK_ERROR';
    this.details = details;
  }
}

function assertPercentage(value, field) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${field} debe estar entre 0 y 100.`);
  }
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateFinalPrice({ price, discountPercent = 0, taxPercent = 0 }) {
  if (!Number.isFinite(price) || price < 0) throw new RangeError('price debe ser mayor o igual que 0.');
  assertPercentage(discountPercent, 'discountPercent');
  assertPercentage(taxPercent, 'taxPercent');
  const discounted = price * (1 - discountPercent / 100);
  return roundMoney(discounted * (1 + taxPercent / 100));
}

export function validateProductDraft(draft) {
  const errors = {};
  if (typeof draft.name !== 'string' || draft.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres.';
  }
  if (!Number.isFinite(draft.price) || draft.price < 0) {
    errors.price = 'El precio debe ser mayor o igual que 0.';
  }
  if (!Number.isInteger(draft.stock) || draft.stock < 0) {
    errors.stock = 'El stock debe ser un entero mayor o igual que 0.';
  }
  return errors;
}

export function canSell(product, quantity) {
  return Number.isInteger(quantity) && quantity > 0 && product.stock >= quantity;
}

export function applyStockMovement(product, movement) {
  if (!Number.isInteger(movement) || movement === 0) {
    throw new TypeError('El movimiento debe ser un entero distinto de 0.');
  }
  const nextStock = product.stock + movement;
  if (nextStock < 0) {
    throw new StockError('No hay stock suficiente para aplicar la salida.', {
      productId: product.id,
      currentStock: product.stock,
      movement
    });
  }
  return { ...product, stock: nextStock };
}
