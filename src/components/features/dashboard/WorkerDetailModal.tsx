'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, MapPin, Star, ChevronDown } from 'lucide-react';
import { Worker } from '@/types';
import { useReviewsQuery } from '@/hooks/useReviewsQuery';
import { useSubmitReviewMutation } from '@/hooks/useSubmitReviewMutation';
import Badge, { getVariantByIndex } from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';

interface Props {
  worker:  Worker;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(price);
}

export default function WorkerDetailModal({ worker, onClose }: Props) {
  const router = useRouter();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment,        setComment]        = useState('');

  // ─── Server state via React Query ───────────────────────────────────────────
  const { data: reviews = [], isLoading: reviewsLoading } = useReviewsQuery(worker.id);

  const submitReview = useSubmitReviewMutation(worker.id);
  const submitted    = submitReview.isSuccess;

  async function handleSubmitReview() {
    if (!selectedRating || !comment.trim()) return;
    submitReview.mutate(
      { rating: selectedRating, comment: comment.trim() },
      { onSuccess: () => setShowReviewForm(false) },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-[430px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-4 mt-4 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-50">
                <img src={worker.avatar} alt={worker.name} className="w-full h-full object-cover" />
              </div>
              {worker.workStatus === 'OPEN' && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              )}
              {worker.workStatus === 'BOOKED' && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{worker.name}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-gray-700">{worker.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({worker.totalReviews} ulasan)</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-gray-500">
                <MapPin size={12} />
                <span className="text-xs">{worker.location}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Usia',        value: `${worker.age} th` },
              { label: 'Pengalaman',  value: `${worker.experience} th` },
              { label: 'Ulasan',      value: worker.totalReviews.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-blue-50 rounded-2xl py-3 px-2 text-center">
                <p className="text-base font-bold text-blue-700">{value}</p>
                <p className="text-xs text-blue-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Bio */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1.5">Tentang</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{worker.bio}</p>
          </div>

          {/* Specializations */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 mb-2">Keahlian</h3>
            <div className="flex flex-wrap gap-2">
              {worker.specializations.map((spec, i) => (
                <Badge key={spec} label={spec} variant={getVariantByIndex(i)} size="md" />
              ))}
            </div>
          </div>

          {/* Price + Book */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tarif harian</p>
              <p className="text-white text-xl font-bold">{formatPrice(worker.pricePerDay)}</p>
            </div>
            <Button
              variant="secondary"
              disabled={worker.workStatus !== 'OPEN'}
              size="md"
              onClick={() => {
                onClose();
                router.push(`/booking/${worker.id}`);
              }}
            >
              {worker.workStatus === 'OPEN'
                ? 'Book Sekarang'
                : worker.workStatus === 'BOOKED'
                ? 'Sedang Booking'
                : 'Tidak Tersedia'}
            </Button>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Ulasan</h3>
              {!submitted && (
                <button
                  onClick={() => setShowReviewForm((v) => !v)}
                  className="text-sm text-blue-500 font-medium flex items-center gap-1"
                >
                  Beri Ulasan
                  <ChevronDown size={14} className={showReviewForm ? 'rotate-180' : ''} />
                </button>
              )}
            </div>

            {showReviewForm && !submitted && (
              <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Rating kamu:</p>
                <StarRating rating={selectedRating} interactive size="lg" onRate={setSelectedRating} />
                <textarea
                  className="w-full mt-3 p-3 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
                  placeholder="Ceritakan pengalamanmu..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                {submitReview.isError && (
                  <p className="text-xs text-red-500 mt-1">Gagal mengirim ulasan. Coba lagi.</p>
                )}
                <Button
                  size="sm"
                  fullWidth
                  className="mt-2"
                  loading={submitReview.isPending}
                  disabled={!selectedRating || !comment.trim()}
                  onClick={handleSubmitReview}
                >
                  Kirim Ulasan
                </Button>
              </div>
            )}

            {submitted && (
              <div className="bg-green-50 rounded-2xl p-3 mb-3 border border-green-200">
                <p className="text-sm text-green-700 font-medium">Ulasan berhasil dikirim!</p>
              </div>
            )}

            {reviewsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada ulasan</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-100 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">{review.userName}</p>
                      <p className="text-xs text-gray-400">{review.date}</p>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-sm text-gray-600 mt-1.5">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
