import { WorkStatus } from '@/types';
import { tukangApi, TukangProfileResponse } from '@/lib/api/tukang.api';

export interface GetTukangProfileResult {
  success: boolean;
  data?: TukangProfileResponse;
  error?: string;
}

export class GetTukangProfileUseCase {
  async execute(token: string): Promise<GetTukangProfileResult> {
    try {
      const data = await tukangApi.getProfile(token);
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal memuat profil tukang',
      };
    }
  }
}
