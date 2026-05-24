import { tukangApi } from '@/lib/api/tukang.api';

export interface UpdateTukangStatusResult {
  success: boolean;
  error?: string;
}

export class UpdateTukangStatusUseCase {
  async execute(isAvailable: boolean, token: string): Promise<UpdateTukangStatusResult> {
    try {
      await tukangApi.updateStatus({ isAvailable }, token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal update status',
      };
    }
  }
}
