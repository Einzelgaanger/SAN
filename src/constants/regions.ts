export const REGIONS = [
  'Machakos',
  'Makueni', 
  'Turkana',
  'Nairobi',
  'Mombasa',
  'Kisumu'
] as const;

export type Region = typeof REGIONS[number]; 