// ─── DIP: abstraction untuk GPS — bisa di-swap ke expo-location di React Native

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type LocationResult =
  | { success: true; coords: LocationCoords }
  | {
      success: false;
      code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
      message: string;
    };

export interface ILocationService {
  checkPermission(): Promise<PermissionStatus>;
  getCurrentPosition(): Promise<LocationResult>;
}
