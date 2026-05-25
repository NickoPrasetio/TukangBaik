'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Calendar, Clock, MapPin, Package,
  Loader2, AlertCircle, ClipboardList, ChevronRight,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { useWorkerOrdersQuery } from '@/hooks/useWorkerOrdersQuery';
import OrderDetailModal from './OrderDetailModal';

// ─── Status Badge ─────────────────────────────────────────────────────────────

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

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order:   Booking;
  onClick: () => void;
}

function OrderCard({ order, onClick }: OrderCardProps) {
  const date = new Date(order.bookingDate).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-orange-100 shadow-sm p-5 flex flex-col gap-3 active:scale-[0.98] transition-transform hover:border-orange-300 hover:shadow-md"
    >
      {/* Header: customer + status + arrow */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight truncate">{order.customerName}</p>
          <p className="text-xs text-gray-400 mt-0.5">Klik untuk lihat detail & mulai proses</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={order.status} />
          <ChevronRight size={16} className="text-orange-300" />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Detail ringkas */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={15} className="text-orange-400 shrink-0" />
          <span className="truncate">{date}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={15} className="text-orange-400 shrink-0" />
          <span>Mulai {order.startTime} · {order.durationDays} hari</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin size={15} className="text-orange-400 shrink-0 mt-0.5" />
          <span className="leading-snug line-clamp-2">
            {order.address}, {order.city}
          </span>
        </div>

        {order.notes && (
          <div className="flex items-start gap-2 text-sm text-gray-500 italic">
            <Package size={15} className="text-gray-300 shrink-0 mt-0.5" />
            <span className="leading-snug line-clamp-1">{order.notes}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderListContent() {
  const router = useRouter();
  const { data: orders, isLoading, isError, error } = useWorkerOrdersQuery();

  const [selectedOrder, setSelectedOrder] = useState<Booking | null>(null);

  return (
    <>
      <main className="flex flex-col min-h-dvh bg-orange-50">
        {/* Header */}
        <div className="bg-white border-b border-orange-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-2xl bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-orange-500" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base">Order Masuk</h1>
            <p className="text-xs text-gray-400">Klik order untuk melihat detail</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 pb-10">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Memuat order…</span>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={26} className="text-red-400" />
              </div>
              <p className="text-sm text-red-500 font-semibold">Gagal memuat order</p>
              <p className="text-xs text-gray-400">
                {(error as Error)?.message ?? 'Terjadi kesalahan. Coba lagi nanti.'}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && orders?.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                <ClipboardList size={26} className="text-orange-400" />
              </div>
              <p className="text-sm text-gray-600 font-semibold">Belum ada order masuk</p>
              <p className="text-xs text-gray-400">
                Order dari customer akan muncul di sini setelah Anda menerima booking.
              </p>
            </div>
          )}

          {/* Order list */}
          {orders && orders.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-semibold px-1">
                {orders.length} order · {orders.filter(o => o.status === 'PENDING').length} menunggu
              </p>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                />
              ))}
            </>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
