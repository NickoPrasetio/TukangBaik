'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Camera, Save, Users, Pencil } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProfileForm } from '@/hooks/useProfileForm';
import { authApi, AuthResponse } from '@/lib/api/auth.api';

interface Props { onClose: () => void; }

export default function ProfileModal({ onClose }: Props) {
  const { user, token, isAdmin } = useAuthStore();
  const { saving, uploadingAvatar, message, isError, saveProfile, uploadAvatar } = useProfileForm();

  const [tab, setTab] = useState<'profile' | 'users'>('profile');

  // Profile form state
  const [name,  setName]  = useState(user?.name  ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const fileRef = useRef<HTMLInputElement>(null);

  // Admin: user list state
  const [users,        setUsers]        = useState<AuthResponse[]>([]);
  const [editingUser,  setEditingUser]  = useState<AuthResponse | null>(null);
  const [editName,     setEditName]     = useState('');
  const [editPhone,    setEditPhone]    = useState('');
  const [adminSaving,  setAdminSaving]  = useState(false);
  const adminFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin && tab === 'users' && token) {
      authApi.getAllUsers(token).then(setUsers).catch(() => {});
    }
  }, [isAdmin, tab, token]);

  const handleSaveProfile = () => saveProfile({ name, phone });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  };

  const handleAdminSave = async () => {
    if (!editingUser || !token) return;
    setAdminSaving(true);
    try {
      const updated = await authApi.adminUpdateUser(editingUser.id, { name: editName, phone: editPhone }, token);
      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      setEditingUser(null);
    } catch {}
    setAdminSaving(false);
  };

  const handleAdminAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingUser || !token) return;
    if (file.size > 5 * 1024 * 1024) return;
    try {
      const updated = await authApi.adminUploadUserAvatar(editingUser.id, file, token);
      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      setEditingUser(updated);
    } catch {}
  };

  const currentAvatar = user?.avatar;
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Profil Saya</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        {/* Tabs (admin only) */}
        {isAdmin && (
          <div className="flex gap-2 mb-5">
            {(['profile', 'users'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {t === 'profile' ? 'Profil Saya' : 'Kelola User'}
              </button>
            ))}
          </div>
        )}

        {/* === PROFILE TAB === */}
        {tab === 'profile' && (
          <div className="flex flex-col gap-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                  {currentAvatar
                    ? <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold text-blue-500">{initials}</span>}
                </div>
                <button onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow">
                  <Camera size={13} className="text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              {uploadingAvatar && <p className="text-xs text-blue-500">Mengupload...</p>}
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Nama</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Email</label>
              <input value={user?.email ?? ''} disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm bg-gray-100 text-gray-400 cursor-not-allowed" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Nomor Telepon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
            </div>

            {message && (
              <p className={`text-sm text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
            )}

            <button onClick={handleSaveProfile} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 text-white font-semibold disabled:opacity-60">
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}

        {/* === USERS TAB (admin) === */}
        {tab === 'users' && isAdmin && (
          <div className="flex flex-col gap-3">
            {editingUser ? (
              <div className="flex flex-col gap-3">
                <button onClick={() => setEditingUser(null)} className="text-sm text-blue-500 self-start">← Kembali</button>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                      {editingUser.avatar
                        ? <img src={editingUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                        : <span className="text-lg font-bold text-blue-500">{editingUser.name.slice(0, 2).toUpperCase()}</span>}
                    </div>
                    <button onClick={() => adminFileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
                      <Camera size={11} className="text-white" />
                    </button>
                    <input ref={adminFileRef} type="file" accept="image/*" className="hidden" onChange={handleAdminAvatarChange} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Nama</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Nomor Telepon</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
                </div>
                <p className="text-xs text-gray-400">Role: <span className="font-medium">{editingUser.role}</span></p>
                <button onClick={handleAdminSave} disabled={adminSaving}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 text-white font-semibold disabled:opacity-60">
                  <Save size={16} /> {adminSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Users size={14} /> {users.length} user terdaftar</p>
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {u.avatar
                          ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          : <span className="text-sm font-bold text-blue-500">{u.name.slice(0, 2).toUpperCase()}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                      </span>
                      <button onClick={() => { setEditingUser(u); setEditName(u.name); setEditPhone(u.phone ?? ''); }}
                        className="p-1.5 rounded-lg hover:bg-gray-200">
                        <Pencil size={14} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
