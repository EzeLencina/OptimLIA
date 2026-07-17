import type { ProductData } from '../types';
import { TITLE_MAX_LENGTH } from '../constants';

export function generateTitle(product: ProductData): string {
  const parts = [
    product.name,
    product.brand,
    product.model,
    product.attribute,
    product.usage,
  ]
    .filter((p) => p.trim())
    .join(' ');

  return parts.substring(0, TITLE_MAX_LENGTH);
}

export function getTitleCharCount(product: ProductData): number {
  return generateTitle(product).length;
}
