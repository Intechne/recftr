export const REGISTRATION_FEES: Record<string, number> = {
  engage: 3500,
  achieve: 4500,
  inspire: 5500,
  adc: 4000,
  "adc-pro": 6000,
};

export const FIELD_KIT_FEE = 2800;
export const EARLY_REGISTRATION_DISCOUNT = 900;

export function calculateRegistrationTotal(program: string, kit: boolean): number | null {
  const base = REGISTRATION_FEES[program];
  if (typeof base !== "number") return null;
  return base + (kit ? FIELD_KIT_FEE : 0) - EARLY_REGISTRATION_DISCOUNT;
}
