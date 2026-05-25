'use client';

import { useState } from 'react';
import {
  X, Calendar, Clock, MapPin, Package,
  CheckCircle2, Loader2, Star,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { useCompleteOrderMutation } from '@/hooks/useCompleteOrderMutation';
import ReviewModal from './ReviewModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Menunggu',     className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-green-100  text-green-700'  },
  CANCELLED: { label: 'Dibatalkan',   className: 'bg-red-100    text-red-600'    },
  COMPLETED: { label: 'Selesai',      className: 'bg-blue-100   text-blue-700'   },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmCompleteDialog({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel:  () => void;
  loading:   boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col items-center text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={28} className="text-blue-500" />
        </div>
        <h3 className="text-base font-black text-gray-900 mb-2">Tandai Order Selesai?</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Pastikan pekerjaan sudah selesai dan kamu puas dengan hasilnya sebelum menandai sebagai selesai.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-gray-200 py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Belum
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-2xl bg-blue-500 text-white py-3 font-bold text-sm hover:bg-blue-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Memproses…</>
              : 'Ya, Selesai'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  order:   Booking;
  onClose: () => void;
}

export default function CustomerOrderDetailModal({ order, onClose }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReview,  setShowReview]  = useState(false);
  const [localStatus, setLocalStatus] = useState<BookingStatus>(order.status);

  const completeMutation = useCompleteOrderMutation();

  const date     = new Date(order.bookingDate).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const mapsUrl  = `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;

  async function handleConfirmComplete() {
    await completeMutation.mutateAsync(order.id);
    setLocalStatus('COMPLETED');
    setShowConfirm(false);
    setShowReview(true);   // langsung buka form review
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop + Sheet */}
      <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
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
              <h2 className="font-black text-gray-900 text-base">Detail Order</h2>
              <p className="text-xs text-gray-400 mt-0.5">ID: {order.id.slice(0, 8)}…</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={localStatus} />
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4 flex flex-col gap-4 pb-8">

            {/* Worker info */}
            {order.workerName && (
              <div className="flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-100 shrink-0">
                  {order.workerAvatar
                    ? <img src={order.workerAvatar} alt={order.workerName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-blue-400 font-bold text-lg">
                        {order.workerName[0]}
                      </div>
                  }
                </div>
                <div>
                  <p className="text-xs text-blue-400 mb-0.5">Tukang</p>
                  <p className="font-bold text-blue-900">{order.workerName}</p>
                </div>
              </div>
            )}

            {/* Jadwal */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                <Calendar size={16} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Tanggal</p>
                  <p className="text-sm font-semibold text-gray-900">{date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                  <Clock size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Mulai</p>
                    <p className="text-sm font-semibold text-gray-900">{order.startTime}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                  <Clock size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Durasi</p>
                    <p className="text-sm font-semibold text-gray-900">{order.durationDays} hari</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lokasi */}
            <div className="bg-orange-50 rounded-2xl px-4 py-3">
              <div className="flex items-start gap-2 mb-2">
                <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-orange-400 mb-0.5">Lokasi Pekerjaan</p>
                  <p className="text-sm font-semibold text-orange-900 leading-snug">
                    {order.address}, {order.city}
                  </p>
                </div>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-orange-500 text-white rounded-xl py-2 text-xs font-bold hover:bg-orange-600 transition-colors"
              >
                <MapPin size={13} />
                Buka di Google Maps
              </a>
            </div>

            {/* Catatan */}
            {order.notes && (
              <div className="flex items-start gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                <Package size={15} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Catatan</p>
                  <p className="text-sm text-gray-700 leading-snug">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Pembayaran */}
            <div className="flex items-center justify-between bg-green-50 rounded-2xl px-4 py-3">
              <p className="text-xs text-green-600 font-semibold">Metode Pembayaran</p>
              <span className="text-sm font-bold text-green-800">{order.paymentMethod}</span>
            </div>

            {/* CTA: Selesai Order — hanya untuk CONFIRMED */}
            {localStatus === 'CONFIRMED' && (
              <div className="pt-2">
                <p className="text-xs text-gray-400 text-center mb-3 leading-relaxed">
                  Klik tombol di bawah jika pekerjaan sudah selesai dan kamu puas dengan hasilnya.
                </p>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white px-5 py-4 font-bold text-sm hover:bg-blue-600 transition-all active:scale-95 shadow-md shadow-blue-200"
                >
                  <CheckCircle2 size={20} />
                  Selesai Order
                </button>
              </div>
            )}

            {/* CTA: Beri Ulasan — untuk COMPLETED yang belum review */}
            {localStatus === 'COMPLETED' && (
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 bg-blue-50 rounded-2xl px-4 py-3">
                  <CheckCircle2 size={16} className="text-blue-500" />
                  <p className="text-sm font-semibold text-blue-700">Order telah selesai</p>
                </div>
                <button
                  onClick={() => setShowReview(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-blue-400 text-blue-600 px-5 py-3 font-bold text-sm hover:bg-blue-50 transition-all active:scale-95"
                >
                  <Star size={16} className="fill-blue-400" />
                  Beri Ulasan
                </button>
              </div>
            )}

            {/* Info status lain */}
            {localStatus === 'PENDING' && (
              <div className="bg-yellow-50 rounded-2xl px-4 py-3 text-center">
                <p className="text-xs text-yellow-700 font-semibold">Menunggu konfirmasi tukang</p>
                <p className="text-xs text-yellow-600 mt-0.5">Tukang akan segera memproses ordermu</p>
              </div>
            )}
            {localStatus === 'CANCELLED' && (
              <div className="bg-red-50 rounded-2xl px-4 py-3 text-center">
                <p className="text-xs text-red-600">Order ini telah dibatalkan.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Confirm Complete Dialog */}
      {showConfirm && (
        <ConfirmCompleteDialog
          onConfirm={handleConfirmComplete}
          onCancel={() => setShowConfirm(false)}
          loading={completeMutation.isPending}
        />
      )}

      {/* Review Modal */}
      {showReview && (
        <ReviewModal
          order={{ ...order, status: 'COMPLETED' }}
          onClose={() => {
            setShowReview(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
