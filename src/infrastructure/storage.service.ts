import type { PublicationFormData } from '../domain/types';
import { STORAGE_KEY } from '../domain/constants';

export const StorageService = {
  save(data: PublicationFormData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  },

  load(): PublicationFormData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PublicationFormData;
    } catch (e) {
      console.warn('Error loading from localStorage:', e);
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
