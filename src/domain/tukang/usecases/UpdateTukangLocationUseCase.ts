import { tukangApi } from '@/lib/api/tukang.api';

export interface UpdateTukangLocationResult {
  success: boolean;
  error?: string;
}

export class UpdateTukangLocationUseCase {
  async execute(latitude: number, longitude: number, token: string): Promise<UpdateTukangLocationResult> {
    try {
      await tukangApi.updateLocation({ latitude, longitude }, token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal update lokasi',
      };
    }
  }
}
