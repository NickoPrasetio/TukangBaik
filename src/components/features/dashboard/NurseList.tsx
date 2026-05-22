'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useNurseStore } from '@/store/nurseStore';
import { Nurse } from '@/types';
import NurseCard from './NurseCard';
import NurseDetailModal from './NurseDetailModal';

export default function NurseList() {
  const { searchQuery, filterAvailable, setSearchQuery, setFilterAvailable, getFilteredNurses } =
    useNurseStore();
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);

  const nurses = getFilteredNurses();

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Cari suster, lokasi, atau keahlian..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-gray-500" />
        <button
          onClick={() => setFilterAvailable(!filterAvailable)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
            filterAvailable
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${filterAvailable ? 'bg-white' : 'bg-green-400'}`}
          />
          Tersedia Sekarang
        </button>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-800">{nurses.length}</span> suster ditemukan
      </p>

      {/* List */}
      {nurses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {nurses.map((nurse) => (
            <NurseCard key={nurse.id} nurse={nurse} onView={setSelectedNurse} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-gray-600 font-medium">Tidak ada suster ditemukan</p>
          <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
        </div>
      )}

      {/* Modal */}
      {selectedNurse && (
        <NurseDetailModal nurse={selectedNurse} onClose={() => setSelectedNurse(null)} />
      )}
    </div>
  );
}
