'use client';

import { useState } from 'react';
import {
  X, Calendar, Clock, MapPin, Package, Loader2,
  AlertTriangle, CheckCircle2, Navigation, Play,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { bookingApi } from '@/lib/api/booking.api';
import { useConfirmOrderMutation } from '@/hooks/useConfirmOrderMutation';

// ─── Haversine distance (km) ──────────────────────────────────────────────────

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Status badge ─────────────────────────────────────────────────────────────

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

// ─── Validation Popup ─────────────────────────────────────────────────────────

interface PopupProps {
  type: 'date' | 'gps' | 'gps-error' | 'success' | null;
  distanceM?: number;
  onClose: () => void;
}

function ValidationPopup({ type, distanceM, onClose }: PopupProps) {
  if (!type) return null;

  const config = {
    date: {
      icon: <Calendar size={36} className="text-amber-500" />,
      bg:   'bg-amber-50',
      title: 'Tanggal Tidak Sesuai',
      body:  'Kamu tidak bisa memulai order ini karena tanggal hari ini berbeda dengan tanggal yang dijadwalkan. Silakan coba kembali pada tanggal yang sesuai.',
    },
    gps: {
      icon: <Navigation size={36} className="text-red-500" />,
      bg:   'bg-red-50',
      title: 'Kamu Terlalu Jauh',
      body:  `Kamu harus berada dalam radius 1 km dari lokasi order untuk memulai.${
        distanceM != null ? ` Jarak saat ini: ${distanceM >= 1000 ? (distanceM / 1000).toFixed(1) + ' km' : Math.round(distanceM) + ' m'}.` : ''
      } Tolong datang ke titik lokasi untuk memulai order.`,
    },
    'gps-error': {
      icon: <AlertTriangle size={36} className="text-orange-500" />,
      bg:   'bg-orange-50',
      title: 'GPS Tidak Tersedia',
      body:  'Tidak dapat mendapatkan lokasi GPS kamu. Pastikan izin lokasi sudah diberikan di browser, lalu coba lagi.',
    },
    success: {
      icon: <CheckCircle2 size={36} className="text-green-500" />,
      bg:   'bg-green-50',
      title: 'Order Dimulai!',
      body:  'Status order telah diubah menjadi "Dikonfirmasi". Selamat bekerja!',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center shadow-xl ${config.bg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center mb-4">
          {config.icon}
        </div>
        <h3 className="text-base font-black text-gray-900 mb-2">{config.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">{config.body}</p>
        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-gray-900 text-white py-3 font-bold text-sm active:scale-95 transition-transform"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  order:   Booking;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: Props) {
  const [validating, setValidating]   = useState(false);
  const [popup,      setPopup]        = useState<PopupProps['type']>(null);
  const [distanceM,  setDistanceM]    = useState<number | undefined>();

  const confirmMutation = useConfirmOrderMutation();

  const date = new Date(order.bookingDate).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const mapsUrl = `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;

  // ─── Validasi & Konfirmasi ──────────────────────────────────────────────────

  async function handleStartOrder() {
    setValidating(true);
    try {
      // 1. Ambil waktu server (bukan device) ──────────────────────────────────
      let serverDate: string;
      try {
        const time = await bookingApi.getServerTime();
        serverDate = time.date; // "YYYY-MM-DD"
      } catch {
        setPopup('gps-error'); // reuse generic error popup
        setValidating(false);
        return;
      }

      // 2. Cek tanggal ────────────────────────────────────────────────────────
      if (serverDate !== order.bookingDate) {
        setPopup('date');
        setValidating(false);
        return;
      }

      // 3. Ambil GPS device ───────────────────────────────────────────────────
      let deviceLat: number, deviceLng: number;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout:            10_000,
            maximumAge:         0,
            enableHighAccuracy: true,
          });
        });
        deviceLat = pos.coords.latitude;
        deviceLng = pos.coords.longitude;
      } catch {
        setPopup('gps-error');
        setValidating(false);
        return;
      }

      // 4. Cek jarak (Haversine) ───────────────────────────────────────────────
      const distKm = getDistanceKm(deviceLat, deviceLng, order.latitude, order.longitude);
      const distM  = distKm * 1000;
      setDistanceM(distM);

      if (distKm > 1) {
        setPopup('gps');
        setValidating(false);
        return;
      }

      // 5. Semua valid → panggil API ───────────────────────────────────────────
      await confirmMutation.mutateAsync(order.id);
      setPopup('success');

    } catch (err) {
      // Error dari backend (conflict, not found, dll) — sudah di-throw oleh mutateAsync
      const msg = err instanceof Error ? err.message : 'Gagal memulai order';
      // Tampilkan sebagai popup gps-error (generic)
      console.error('confirmOrder error:', msg);
      setPopup('gps-error');
    } finally {
      setValidating(false);
    }
  }

  function handlePopupClose() {
    if (popup === 'success') {
      setPopup(null);
      onClose(); // tutup modal, list sudah di-refresh via cache invalidation
    } else {
      setPopup(null);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Sheet */}
        <div
          className="relative bg-white rounded-t-3xl w-full max-w-[430px] max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
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
              <StatusBadge status={order.status} />
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4 flex flex-col gap-4 pb-8">

            {/* Customer */}
            <div className="bg-gray-50 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">Customer</p>
              <p className="font-bold text-gray-900">{order.customerName}</p>
            </div>

            {/* Jadwal */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3">
                <Calendar size={16} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs text-blue-400">Tanggal</p>
                  <p className="text-sm font-semibold text-blue-900">{date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-purple-50 rounded-2xl px-4 py-3">
                  <Clock size={16} className="text-purple-500 shrink-0" />
                  <div>
                    <p className="text-xs text-purple-400">Mulai</p>
                    <p className="text-sm font-semibold text-purple-900">{order.startTime}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-purple-50 rounded-2xl px-4 py-3">
                  <Clock size={16} className="text-purple-500 shrink-0" />
                  <div>
                    <p className="text-xs text-purple-400">Durasi</p>
                    <p className="text-sm font-semibold text-purple-900">{order.durationDays} hari</p>
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
                  <p className="font-mono text-xs text-orange-400 mt-1">
                    {order.latitude.toFixed(6)}, {order.longitude.toFixed(6)}
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

            {/* Metode Pembayaran */}
            <div className="flex items-center justify-between bg-green-50 rounded-2xl px-4 py-3">
              <p className="text-xs text-green-600 font-semibold">Metode Pembayaran</p>
              <span className="text-sm font-bold text-green-800">{order.paymentMethod}</span>
            </div>

            {/* Tombol Mulai Proses — hanya untuk PENDING */}
            {order.status === 'PENDING' && (
              <div className="pt-2">
                <p className="text-xs text-gray-400 text-center mb-3 leading-relaxed">
                  Sistem akan memverifikasi lokasi GPS kamu dan tanggal hari ini sebelum memulai order.
                </p>
                <button
                  onClick={handleStartOrder}
                  disabled={validating || confirmMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 text-white px-5 py-4 font-bold text-sm hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-orange-200"
                >
                  {validating || confirmMutation.isPending
                    ? <><Loader2 size={20} className="animate-spin" /> Memverifikasi…</>
                    : <><Play size={18} className="fill-white" /> Mulai Proses Order</>
                  }
                </button>
              </div>
            )}

            {/* Info jika bukan PENDING */}
            {order.status !== 'PENDING' && (
              <div className="bg-gray-50 rounded-2xl px-4 py-3 text-center">
                <p className="text-xs text-gray-500">
                  Order ini sudah berstatus <strong>{STATUS_CONFIG[order.status]?.label ?? order.status}</strong>.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Validation Popup */}
      <ValidationPopup
        type={popup}
        distanceM={distanceM}
        onClose={handlePopupClose}
      />
    </>
  );
}
