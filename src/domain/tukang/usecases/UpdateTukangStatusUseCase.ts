import { WorkStatus } from '@/types';
import { tukangApi } from '@/lib/api/tukang.api';

export interface UpdateTukangStatusResult {
  success: boolean;
  error?: string;
}

export class UpdateTukangStatusUseCase {
  async execute(status: WorkStatus, token: string): Promise<UpdateTukangStatusResult> {
    try {
      await tukangApi.updateStatus({ status }, token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal update status',
      };
    }
  }
}
