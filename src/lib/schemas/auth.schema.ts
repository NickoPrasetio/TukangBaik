import { z } from 'zod';

// ─── Signup ───────────────────────────────────────────────────────────────────

export const signupSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    phone: z
      .string()
      .min(1, 'Nomor HP wajib diisi')
      .regex(/^08\d{8,11}$/, 'Format: 08xxxxxxxxxx'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    userType: z.enum(['CUSTOMER', 'TUKANG'] as const),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password tidak sama',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
export type UserType = SignupFormValues['userType'];

// ─── Google Signup Completion ─────────────────────────────────────────────────
// Dipakai saat user baru mendaftar via Google.
// name & email sudah diisi dari Google (read-only); hanya userType yang wajib,
// phone opsional.

export const googleSignupSchema = z.object({
  userType: z.enum(['CUSTOMER', 'TUKANG'] as const, {
    error: 'Pilih tipe akun terlebih dahulu',
  }),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^08\d{8,11}$/.test(v), {
      message: 'Format: 08xxxxxxxxxx',
    }),
});

export type GoogleSignupFormValues = z.infer<typeof googleSignupSchema>;

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
