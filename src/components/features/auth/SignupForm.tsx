'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupForm() {
  const router = useRouter();
  const { signup } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function setField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!form.email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Format email tidak valid';
    if (!form.phone) newErrors.phone = 'Nomor HP wajib diisi';
    else if (!/^08\d{8,11}$/.test(form.phone)) newErrors.phone = 'Format: 08xxxxxxxxxx';
    if (!form.password) newErrors.password = 'Password wajib diisi';
    else if (form.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Password tidak sama';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await signup(form.name, form.email, form.password, form.phone);
    setLoading(false);
    router.push('/dashboard');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Nama Lengkap"
        type="text"
        placeholder="Masukkan nama lengkap"
        icon={<User size={18} />}
        value={form.name}
        onChange={(e) => setField('name', e.target.value)}
        error={errors.name}
        autoComplete="name"
      />

      <Input
        label="Email"
        type="email"
        placeholder="email@contoh.com"
        icon={<Mail size={18} />}
        value={form.email}
        onChange={(e) => setField('email', e.target.value)}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        label="Nomor HP"
        type="tel"
        placeholder="08xxxxxxxxxx"
        icon={<Phone size={18} />}
        value={form.phone}
        onChange={(e) => setField('phone', e.target.value)}
        error={errors.phone}
        autoComplete="tel"
      />

      <Input
        label="Password"
        type="password"
        placeholder="Minimal 6 karakter"
        icon={<Lock size={18} />}
        value={form.password}
        onChange={(e) => setField('password', e.target.value)}
        error={errors.password}
        autoComplete="new-password"
      />

      <Input
        label="Konfirmasi Password"
        type="password"
        placeholder="Ulangi password"
        icon={<Lock size={18} />}
        value={form.confirmPassword}
        onChange={(e) => setField('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
        Daftar
      </Button>

      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-blue-500 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
