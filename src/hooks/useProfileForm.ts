'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { updateProfileUseCase, uploadAvatarUseCase } from '@/data/auth';

export function useProfileForm() {
  const { token, setUser } = useAuthStore();

  const [saving,          setSaving]          = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message,         setMessage]         = useState('');
  const [isError,         setIsError]         = useState(false);

  function showMessage(text: string, error = false) {
    setMessage(text);
    setIsError(error);
  }

  async function saveProfile(data: { name?: string; phone?: string }) {
    if (!token) return;
    setSaving(true);
    showMessage('');

    const result = await updateProfileUseCase.execute(token, data);

    if (result.success) {
      setUser(result.data);
      showMessage('Profil berhasil disimpan');
    } else {
      showMessage(result.error.message, true);
    }
    setSaving(false);
  }

  async function uploadAvatar(file: File) {
    if (!token) return;
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Ukuran file maksimal 5MB', true);
      return;
    }
    setUploadingAvatar(true);
    showMessage('');

    const result = await uploadAvatarUseCase.execute(token, file);

    if (result.success) {
      setUser(result.data);
      showMessage('Foto berhasil diupload');
    } else {
      showMessage(result.error.message, true);
    }
    setUploadingAvatar(false);
  }

  return {
    saving,
    uploadingAvatar,
    message,
    isError,
    saveProfile,
    uploadAvatar,
  };
}
