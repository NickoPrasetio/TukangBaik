import { create } from 'zustand';
import { Nurse } from '@/types';
import { nurseApi } from '@/lib/api/nurse.api';

interface NurseState {
  nurses: Nurse[];
  searchQuery: string;
  filterAvailable: boolean;
  loading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  setFilterAvailable: (value: boolean) => void;
  fetchNurses: () => Promise<void>;
  updateNurseLocally: (nurseId: string, patch: Partial<Nurse>) => void;
}

export const useNurseStore = create<NurseState>((set, get) => ({
  nurses: [],
  searchQuery: '',
  filterAvailable: false,
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterAvailable: (value) => set({ filterAvailable: value }),

  fetchNurses: async () => {
    const { searchQuery, filterAvailable } = get();
    set({ loading: true, error: null });
    try {
      const nurses = await nurseApi.getAll(
        searchQuery || undefined,
        filterAvailable || undefined
      );
      set({ nurses, loading: false });
    } catch (e) {
      set({ error: 'Gagal memuat data suster', loading: false });
    }
  },

  updateNurseLocally: (nurseId, patch) => {
    set((state) => ({
      nurses: state.nurses.map((n) => (n.id === nurseId ? { ...n, ...patch } : n)),
    }));
  },
}));
