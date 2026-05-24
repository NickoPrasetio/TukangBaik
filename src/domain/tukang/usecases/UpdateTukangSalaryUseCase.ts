import { tukangApi } from '@/lib/api/tukang.api';

export interface UpdateTukangSalaryResult {
  success: boolean;
  error?: string;
}

export class UpdateTukangSalaryUseCase {
  async execute(pricePerDay: number, token: string): Promise<UpdateTukangSalaryResult> {
    try {
      await tukangApi.updateSalary({ pricePerDay }, token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal update gaji',
      };
    }
  }
}
