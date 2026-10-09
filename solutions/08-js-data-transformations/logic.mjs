export function normalizeSearchTerm(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es');
}

export function filterProducts(products, query) {
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) return [...products];

  return products.filter((product) => {
    const searchableText = normalizeSearchTerm(
      `${product.name} ${product.category} ${product.description ?? ''}`
    );
    return searchableText.includes(normalizedQuery);
  });
}

export function sortProducts(products, criterion = 'name', direction = 'asc') {
  const allowedCriteria = new Set(['name', 'price', 'stock']);
  const field = allowedCriteria.has(criterion) ? criterion : 'name';
  const multiplier = direction === 'desc' ? -1 : 1;

  return products.toSorted((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];
    const comparison = typeof leftValue === 'string'
      ? leftValue.localeCompare(String(rightValue), 'es', { sensitivity: 'base' })
      : Number(leftValue) - Number(rightValue);
    return comparison * multiplier;
  });
}

export function groupProductsByCategory(products) {
  return products.reduce((groups, product) => {
    const category = product.category;
    return {
      ...groups,
      [category]: [...(groups[category] ?? []), product]
    };
  }, {});
}

export function summarizeInventory(products) {
  return products.reduce(
    (summary, product) => ({
      productCount: summary.productCount + 1,
      totalUnits: summary.totalUnits + product.stock,
      totalValue: summary.totalValue + product.price * product.stock
    }),
    { productCount: 0, totalUnits: 0, totalValue: 0 }
  );
}
