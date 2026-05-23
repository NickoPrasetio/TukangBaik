'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse.api';
import { useAuthStore } from '@/store/authStore';
import { useNurseStore } from '@/store/nurseStore';

interface Props {
  onClose: () => void;
}

export default function AddNurseModal({ onClose }: Props) {
  const token = useAuthStore((s) => s.token);
  const fetchNurses = useNurseStore((s) => s.fetchNurses);

  const [form, setForm] = useState({
    name: '',
    age: '',
    experience: '',
    location: '',
    pricePerDay: '',
    bio: '',
    specializations: '',
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.pricePerDay) {
      setError('Nama, lokasi, dan harga wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await nurseApi.create(
        {
          name: form.name,
          age: Number(form.age) || 0,
          experience: Number(form.experience) || 0,
          location: form.location,
          pricePerDay: Number(form.pricePerDay),
          bio: form.bio,
          specializations: form.specializations
            ? form.specializations.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          isAvailable: form.isAvailable,
        },
        token!
      );
      await fetchNurses();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan suster');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Tambah Suster Baru</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Nama Lengkap *">
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="cth. Sari Dewi" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Usia">
              <input name="age" type="number" value={form.age} onChange={handleChange}
                placeholder="cth. 28" className={inputCls} />
            </Field>
            <Field label="Pengalaman (tahun)">
              <input name="experience" type="number" value={form.experience} onChange={handleChange}
                placeholder="cth. 5" className={inputCls} />
            </Field>
          </div>

          <Field label="Lokasi *">
            <input name="location" value={form.location} onChange={handleChange}
              placeholder="cth. Jakarta Selatan" className={inputCls} />
          </Field>

          <Field label="Harga per Hari (Rp) *">
            <input name="pricePerDay" type="number" value={form.pricePerDay} onChange={handleChange}
              placeholder="cth. 350000" className={inputCls} />
          </Field>

          <Field label="Spesialisasi (pisahkan koma)">
            <input name="specializations" value={form.specializations} onChange={handleChange}
              placeholder="cth. Perawatan Bayi, Laktasi" className={inputCls} />
          </Field>

          <Field label="Bio">
            <textarea name="bio" value={form.bio} onChange={handleChange}
              placeholder="Deskripsi singkat tentang suster..."
              rows={3} className={`${inputCls} resize-none`} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="isAvailable" checked={form.isAvailable}
              onChange={handleChange} className="w-4 h-4 accent-blue-500" />
            Tersedia sekarang
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 text-white font-semibold text-base disabled:opacity-60">
            {loading ? 'Menyimpan...' : <><Plus size={18} /> Tambah Suster</>}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
