'use client';

import { useEffect, useRef } from 'react';

interface LatLng {
  lat: number;
  lng: number;
}

interface MapPickerProps {
  center: LatLng;
  value: LatLng;
  onChange: (coords: LatLng) => void;
}

/**
 * Leaflet map untuk memilih titik lokasi secara interaktif.
 * Di-render hanya di client (dynamic import tanpa SSR).
 */
export default function MapPicker({ center, value, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markerRef    = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Lazy load leaflet (avoid SSR issues)
    import('leaflet').then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!).setView([center.lat, center.lng], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([value.lat, value.lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange({ lat: pos.lat, lng: pos.lng });
      });

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChange({ lat, lng });
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fly to new center when city changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    mapRef.current.flyTo([center.lat, center.lng], 13, { duration: 1 });
    markerRef.current.setLatLng([center.lat, center.lng]);
    onChange(center);
  }, [center.lat, center.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={containerRef}
        className="w-full h-64 rounded-2xl overflow-hidden border-2 border-gray-200 z-0"
        style={{ position: 'relative' }}
      />
      <p className="text-xs text-gray-400 mt-1.5 text-center">
        Klik peta atau geser marker untuk menentukan lokasi tepat
      </p>
    </>
  );
}
