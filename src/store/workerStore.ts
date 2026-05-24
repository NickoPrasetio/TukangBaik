import { create } from 'zustand';

/**
 * Hanya menyimpan UI state untuk filter & search.
 * Server state (workers[], loading, error) dikelola React Query.
 */
interface WorkerUIState {
  searchQuery:     string;
  filterAvailable: boolean;
  setSearchQuery:     (query: string)  => void;
  setFilterAvailable: (value: boolean) => void;
}

export const useWorkerStore = create<WorkerUIState>((set) => ({
  searchQuery:     '',
  filterAvailable: false,
  setSearchQuery:     (query) => set({ searchQuery: query }),
  setFilterAvailable: (value) => set({ filterAvailable: value }),
}));
