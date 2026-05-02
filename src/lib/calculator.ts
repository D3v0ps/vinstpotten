export const PRICE_PER_SHIRT = 249;
export const COST_PER_SHIRT = 95;
export const PROFIT_PER_SHIRT = PRICE_PER_SHIRT - COST_PER_SHIRT;

export interface CalcResult {
  totalShirts: number;
  revenue: number;
  profit: number;
  cost: number;
}

export function calcResults(sellers: number, shirtsPer: number): CalcResult {
  const totalShirts = sellers * shirtsPer;
  return {
    totalShirts,
    revenue: totalShirts * PRICE_PER_SHIRT,
    cost: totalShirts * COST_PER_SHIRT,
    profit: totalShirts * PROFIT_PER_SHIRT,
  };
}

export const formatSEK = (n: number) => n.toLocaleString('sv-SE');
