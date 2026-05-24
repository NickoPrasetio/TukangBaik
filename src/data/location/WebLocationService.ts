import {
  ILocationService,
  LocationResult,
  PermissionStatus,
} from '@/domain/location/ILocationService';

/**
 * Implementasi web menggunakan navigator.geolocation + Permissions API.
 * Untuk React Native: buat RNLocationService yang implements ILocationService
 * menggunakan expo-location, lalu inject ke useLocation().
 */
export class WebLocationService implements ILocationService {
  private readonly options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  };

  async checkPermission(): Promise<PermissionStatus> {
    if (!('geolocation' in navigator)) return 'unsupported';
    if (!('permissions' in navigator)) return 'prompt'; // browser lama
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state as PermissionStatus;
    } catch {
      return 'prompt';
    }
  }

  getCurrentPosition(): Promise<LocationResult> {
    if (!('geolocation' in navigator)) {
      return Promise.resolve({
        success: false,
        code: 'UNSUPPORTED',
        message: 'Browser tidak mendukung GPS',
      });
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            success: true,
            coords: {
              latitude:  pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy:  pos.coords.accuracy,
            },
          }),
        (err) => {
          if (err.code === err.PERMISSION_DENIED)
            resolve({ success: false, code: 'PERMISSION_DENIED', message: 'Izin lokasi ditolak. Aktifkan di pengaturan browser.' });
          else if (err.code === err.TIMEOUT)
            resolve({ success: false, code: 'TIMEOUT', message: 'Timeout. Pastikan GPS aktif dan coba lagi.' });
          else
            resolve({ success: false, code: 'POSITION_UNAVAILABLE', message: 'Sinyal GPS tidak tersedia. Coba di tempat terbuka.' });
        },
        this.options,
      );
    });
  }
}
