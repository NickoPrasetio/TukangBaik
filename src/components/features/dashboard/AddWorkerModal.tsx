'use client';

import { useState, useRef } from 'react';
import { X, Plus, Camera } from 'lucide-react';
import { useAddWorkerMutation } from '@/hooks/useAddWorkerMutation';

interface Props { onClose: () => void; }

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

export default function AddWorkerModal({ onClose }: Props) {
  const addWorker = useAddWorkerMutation();

  const [form, setForm] = useState({
    name: '', age: '', experience: '', location: '',
    pricePerDay: '', bio: '', specializations: '', isAvailable: true,
  });
  const [photo,        setPhoto]        = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.location || !form.pricePerDay) return;

    addWorker.mutate(
      {
        data: {
          name:            form.name,
          age:             Number(form.age) || 0,
          experience:      Number(form.experience) || 0,
          location:        form.location,
          pricePerDay:     Number(form.pricePerDay),
          bio:             form.bio,
          specializations: form.specializations
            ? form.specializations.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          isAvailable: form.isAvailable,
        },
        photo,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Tambah Tukang Baru</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Photo */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                {photoPreview
                  ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  : <Camera size={24} className="text-gray-400" />}
              </div>
              <button type="button" onClick={() => photoRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow">
                <Plus size={13} className="text-white" />
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <p className="text-xs text-gray-400">Foto tukang (maks. 5MB)</p>
          </div>

          <Field label="Nama Lengkap *">
            <input name="name" value={form.name} onChange={handleChange} placeholder="cth. Budi Santoso" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Usia">
              <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="cth. 35" className={inputCls} />
            </Field>
            <Field label="Pengalaman (tahun)">
              <input name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="cth. 8" className={inputCls} />
            </Field>
          </div>

          <Field label="Lokasi *">
            <input name="location" value={form.location} onChange={handleChange} placeholder="cth. Jakarta Selatan" className={inputCls} />
          </Field>

          <Field label="Harga per Hari (Rp) *">
            <input name="pricePerDay" type="number" value={form.pricePerDay} onChange={handleChange} placeholder="cth. 350000" className={inputCls} />
          </Field>

          <Field label="Keahlian (pisahkan koma)">
            <input name="specializations" value={form.specializations} onChange={handleChange} placeholder="cth. Pasang Keramik, Cat Dinding" className={inputCls} />
          </Field>

          <Field label="Bio">
            <textarea name="bio" value={form.bio} onChange={handleChange}
              placeholder="Deskripsi singkat tentang tukang..." rows={3} className={`${inputCls} resize-none`} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} className="w-4 h-4 accent-blue-500" />
            Tersedia sekarang
          </label>

          {addWorker.isError && (
            <p className="text-sm text-red-500">
              {addWorker.error instanceof Error ? addWorker.error.message : 'Gagal menambahkan tukang'}
            </p>
          )}

          <button type="submit" disabled={addWorker.isPending}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 text-white font-semibold text-base disabled:opacity-60">
            {addWorker.isPending ? 'Menyimpan...' : <><Plus size={18} /> Tambah Tukang</>}
          </button>
        </form>
      </div>
    </div>
  );
}
