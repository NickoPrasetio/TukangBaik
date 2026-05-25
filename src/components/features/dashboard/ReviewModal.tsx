'use client';

import { useRef, useState } from 'react';
import { X, Camera, Star, Trash2, Loader2, CheckCircle2, AlertCircle, ImagePlus } from 'lucide-react';
import { useSubmitOrderReviewMutation } from '@/hooks/useSubmitOrderReviewMutation';
import { Booking } from '@/types';

const MAX_PHOTOS     = 5;
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

interface Props {
  order:   Booking;
  onClose: () => void;
}

interface PhotoItem {
  file:    File;
  preview: string;
  error?:  string;
}

// ─── Star Picker ─────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform active:scale-90"
        >
          <Star
            size={36}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: 'Sangat Buruk',
  2: 'Buruk',
  3: 'Cukup',
  4: 'Bagus',
  5: 'Sangat Bagus!',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReviewModal({ order, onClose }: Props) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [photos,  setPhotos]  = useState<PhotoItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitMutation = useSubmitOrderReviewMutation();

  // ─── Photo handling ────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, remaining).map<PhotoItem>((file) => {
      if (file.size > MAX_SIZE_BYTES) {
        return {
          file,
          preview: '',
          error: `${file.name} melebihi 50 MB`,
        };
      }
      return {
        file,
        preview: URL.createObjectURL(file),
      };
    });

    setPhotos((prev) => [...prev, ...toAdd]);
    // Reset input so same file can be re-selected after remove
    e.target.value = '';
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const removed = prev[idx];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  const validPhotos  = photos.filter((p) => !p.error);
  const hasPhotoErr  = photos.some((p) => !!p.error);
  const canSubmit    = rating > 0 && !hasPhotoErr && !submitMutation.isPending;

  // ─── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit() {
    if (!canSubmit) return;
    submitMutation.mutate(
      {
        workerId:  order.workerId,
        bookingId: order.id,
        rating,
        comment:   comment.trim(),
        photos:    validPhotos.map((p) => p.file),
      },
      { onSuccess: () => {} }, // stay open to show success state
    );
  }

  // ─── Success state ─────────────────────────────────────────────────────────

  if (submitMutation.isSuccess) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-5" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-1">Ulasan Terkirim!</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Terima kasih sudah memberikan ulasan. Masukan kamu sangat berarti!
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-blue-500 text-white py-3 font-bold text-sm hover:bg-blue-600 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-[430px] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-base">Beri Ulasan</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Ceritakan pengalamanmu dengan {order.workerName ?? 'tukang ini'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5 pb-8">

          {/* Rating */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-gray-700">Rating Kamu</p>
            <StarPicker value={rating} onChange={setRating} />
            <p className={`text-sm font-bold transition-all ${rating ? 'text-amber-500' : 'text-gray-300'}`}>
              {rating ? RATING_LABELS[rating] : 'Pilih bintang…'}
            </p>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Komentar <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalamanmu bekerja dengan tukang ini…"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-gray-50"
            />
          </div>

          {/* Photo Upload */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Foto Hasil Kerja <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <span className="text-xs text-gray-400">
                {photos.length}/{MAX_PHOTOS} foto · maks. 50 MB/foto
              </span>
            </div>

            {/* Photo previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((item, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {item.error ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-red-50">
                        <AlertCircle size={20} className="text-red-400 mb-1" />
                        <p className="text-[10px] text-red-500 text-center leading-tight">{item.error}</p>
                      </div>
                    ) : (
                      <img
                        src={item.preview}
                        alt={`foto-${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <Trash2 size={10} className="text-white" />
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <ImagePlus size={20} className="text-blue-400" />
                    <span className="text-[10px] text-blue-400 font-medium">Tambah</span>
                  </button>
                )}
              </div>
            )}

            {/* Upload button when empty */}
            {photos.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 w-full rounded-2xl border-2 border-dashed border-gray-200 px-4 py-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Camera size={20} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">Upload Foto</p>
                  <p className="text-xs text-gray-400">Max {MAX_PHOTOS} foto · Maks. 50 MB per foto</p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Photo error summary */}
            {hasPhotoErr && (
              <div className="flex items-start gap-2 bg-red-50 rounded-2xl px-3 py-2">
                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-500">
                  Hapus foto yang melebihi batas ukuran sebelum melanjutkan.
                </p>
              </div>
            )}
          </div>

          {/* Submit error */}
          {submitMutation.isError && (
            <div className="flex items-start gap-2 bg-red-50 rounded-2xl px-4 py-3">
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">
                {submitMutation.error instanceof Error
                  ? submitMutation.error.message
                  : 'Gagal mengirim ulasan. Coba lagi.'}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white py-4 font-bold text-sm hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200"
          >
            {submitMutation.isPending
              ? <><Loader2 size={18} className="animate-spin" /> Mengirim…</>
              : <><Star size={16} className="fill-white" /> Kirim Ulasan</>
            }
          </button>

          <p className="text-center text-xs text-gray-400">
            Ulasan hanya dapat dikirim sekali setelah order selesai
          </p>
        </div>
      </div>
    </div>
  );
}
