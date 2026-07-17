import type { PricingData, PriceCalculation } from '../types';

export function calculatePrice(pricing: PricingData): PriceCalculation {
  const cost = parseFloat(pricing.productCost) || 0;
  const commission = parseFloat(pricing.commission) || 13;
  const shipping = parseFloat(pricing.shippingCost) || 0;
  const margin = parseFloat(pricing.margin) || 30;
  const fixed = parseFloat(pricing.fixedCost) || 0;

  const totalCost = cost + shipping + fixed;
  const denominator = 1 - commission / 100 - margin / 100;

  if (denominator <= 0 || totalCost === 0) {
    return { suggestedPrice: 0, netProfit: 0, roi: 0 };
  }

  const suggestedPrice = totalCost / denominator;
  const netProfit = suggestedPrice - (suggestedPrice * commission) / 100 - totalCost;
  const roi = cost > 0 ? (netProfit / cost) * 100 : 0;

  return {
    suggestedPrice: Math.round(suggestedPrice),
    netProfit: Math.round(netProfit),
    roi: Math.round(roi),
  };
}
