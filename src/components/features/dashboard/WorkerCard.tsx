'use client';

import { MapPin, Clock, Star } from 'lucide-react';
import { Worker } from '@/types';
import Badge, { getVariantByIndex } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface WorkerCardProps {
  worker: Worker;
  onView: (worker: Worker) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function WorkerCard({ worker, onView }: WorkerCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-50 flex items-center justify-center">
            {worker.avatar
              ? <img src={worker.avatar} alt={worker.name} className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              : <span className="text-xl font-bold text-blue-400">{worker.name.slice(0, 2).toUpperCase()}</span>}
          </div>
          {worker.isAvailable && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
              {worker.name}
            </h3>
            <span
              className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                worker.isAvailable
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {worker.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-gray-700">{worker.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({worker.totalReviews} ulasan)</span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-gray-500">
            <MapPin size={12} />
            <span className="text-xs">{worker.location}</span>
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-1.5">
        {worker.specializations.map((spec, i) => (
          <Badge key={spec} label={spec} variant={getVariantByIndex(i)} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock size={12} />
            <span className="text-xs">{worker.experience} tahun pengalaman</span>
          </div>
          <p className="font-bold text-blue-600 text-base mt-0.5">
            {formatPrice(worker.pricePerDay)}
            <span className="text-xs font-normal text-gray-400">/hari</span>
          </p>
        </div>
        <Button
          size="sm"
          variant={worker.isAvailable ? 'primary' : 'outline'}
          disabled={!worker.isAvailable}
          onClick={() => onView(worker)}
        >
          {worker.isAvailable ? 'Lihat' : 'Penuh'}
        </Button>
      </div>
    </div>
  );
}
