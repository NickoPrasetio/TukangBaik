import { create } from 'zustand';
import { Worker } from '@/types';
import { workerApi } from '@/lib/api/worker.api';

interface WorkerState {
  workers: Worker[];
  searchQuery: string;
  filterAvailable: boolean;
  loading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  setFilterAvailable: (value: boolean) => void;
  fetchWorkers: () => Promise<void>;
  updateWorkerLocally: (workerId: string, patch: Partial<Worker>) => void;
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  workers: [],
  searchQuery: '',
  filterAvailable: false,
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterAvailable: (value) => set({ filterAvailable: value }),

  fetchWorkers: async () => {
    const { searchQuery, filterAvailable } = get();
    set({ loading: true, error: null });
    try {
      const workers = await workerApi.getAll(
        searchQuery || undefined,
        filterAvailable || undefined
      );
      set({ workers, loading: false });
    } catch (e) {
      set({ error: 'Gagal memuat data tukang', loading: false });
    }
  },

  updateWorkerLocally: (workerId, patch) => {
    set((state) => ({
      workers: state.workers.map((w) => (w.id === workerId ? { ...w, ...patch } : w)),
    }));
  },
}));
