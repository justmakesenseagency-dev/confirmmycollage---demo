import { create } from 'zustand';
import { StorageService } from '../services/storage';

interface ShortlistStore {
  shortlist: string[];
  compareList: string[];
  toggleShortlist: (collegeId: string) => void;
  isShortlisted: (collegeId: string) => boolean;
  addCompare: (collegeId: string) => { success: boolean; message?: string };
  removeCompare: (collegeId: string) => void;
  clearCompare: () => void;
  isComparing: (collegeId: string) => boolean;
}

export const useShortlistStore = create<ShortlistStore>((set, get) => ({
  shortlist: StorageService.getShortlist(),
  compareList: StorageService.getCompareList(),

  toggleShortlist: (collegeId: string) => {
    const current = get().shortlist;
    const exists = current.includes(collegeId);
    const updated = exists ? current.filter((id) => id !== collegeId) : [...current, collegeId];
    StorageService.setShortlist(updated);
    set({ shortlist: updated });
  },

  isShortlisted: (collegeId: string) => {
    return get().shortlist.includes(collegeId);
  },

  addCompare: (collegeId: string) => {
    const current = get().compareList;
    if (current.includes(collegeId)) {
      return { success: true };
    }
    if (current.length >= 5) {
      return {
        success: false,
        message: 'You can compare a maximum of 5 colleges side by side.',
      };
    }
    const updated = [...current, collegeId];
    StorageService.setCompareList(updated);
    set({ compareList: updated });
    return { success: true };
  },

  removeCompare: (collegeId: string) => {
    const updated = get().compareList.filter((id) => id !== collegeId);
    StorageService.setCompareList(updated);
    set({ compareList: updated });
  },

  clearCompare: () => {
    StorageService.setCompareList([]);
    set({ compareList: [] });
  },

  isComparing: (collegeId: string) => {
    return get().compareList.includes(collegeId);
  },
}));
