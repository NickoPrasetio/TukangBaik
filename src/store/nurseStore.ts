import { create } from 'zustand';
import { Nurse } from '@/types';
import { DUMMY_NURSES } from '@/data/nurses';

interface NurseState {
  nurses: Nurse[];
  searchQuery: string;
  filterAvailable: boolean;
  selectedNurse: Nurse | null;
  setSearchQuery: (query: string) => void;
  setFilterAvailable: (value: boolean) => void;
  setSelectedNurse: (nurse: Nurse | null) => void;
  submitRating: (nurseId: string, rating: number, comment: string, userName: string) => void;
  getFilteredNurses: () => Nurse[];
}

export const useNurseStore = create<NurseState>((set, get) => ({
  nurses: DUMMY_NURSES,
  searchQuery: '',
  filterAvailable: false,
  selectedNurse: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterAvailable: (value) => set({ filterAvailable: value }),
  setSelectedNurse: (nurse) => set({ selectedNurse: nurse }),

  submitRating: (nurseId, rating, comment, userName) => {
    set((state) => ({
      nurses: state.nurses.map((nurse) => {
        if (nurse.id !== nurseId) return nurse;
        const newReview = {
          id: `r${Date.now()}`,
          userId: `u${Date.now()}`,
          userName,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0],
        };
        const allReviews = [newReview, ...nurse.reviews];
        const newRating =
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        return {
          ...nurse,
          reviews: allReviews,
          totalReviews: allReviews.length,
          rating: Math.round(newRating * 10) / 10,
        };
      }),
    }));
  },

  getFilteredNurses: () => {
    const { nurses, searchQuery, filterAvailable } = get();
    return nurses.filter((nurse) => {
      const matchesSearch =
        nurse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nurse.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nurse.specializations.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesAvailable = filterAvailable ? nurse.isAvailable : true;
      return matchesSearch && matchesAvailable;
    });
  },
}));
