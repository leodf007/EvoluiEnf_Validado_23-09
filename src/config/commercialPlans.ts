export const COMMERCIAL_PLAN_CONFIG = {
  FREE: {
    monthlyPriceBRL: 0,
    documentsPerMonth: 10,
    aiRequestsPerMonth: 5,
  },
  PRO: {
    monthlyPriceBRL: 34.97,
    documentsPerMonth: 100,
    aiRequestsPerMonth: 100,
  },
} as const;

export type CommercialPlanKey = keyof typeof COMMERCIAL_PLAN_CONFIG;

export function formatMonthlyPriceBRL(value: number): string {
  if (value === 0) return 'R$ 0 / mês';
  return `R$ ${value.toFixed(2).replace('.', ',')} / mês`;
}
