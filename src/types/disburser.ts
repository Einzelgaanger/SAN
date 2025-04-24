export interface Disburser {
  id: string;
  name: string;
  email: string;
  region: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Region = 'Machakos' | 'Makueni' | 'Turkana' | 'Nairobi' | 'Mombasa' | 'Kisumu';

export const REGIONS: Region[] = ['Machakos', 'Makueni', 'Turkana', 'Nairobi', 'Mombasa', 'Kisumu']; 