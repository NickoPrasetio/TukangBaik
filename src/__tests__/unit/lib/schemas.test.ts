import { signupSchema, loginSchema, googleSignupSchema } from '@/lib/schemas/auth.schema';

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('passes with valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('fails when email is empty', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('fails when email format is invalid', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('fails when password is shorter than 6 chars', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '12345' });
    expect(result.success).toBe(false);
  });
});

// ─── signupSchema ─────────────────────────────────────────────────────────────

describe('signupSchema', () => {
  const valid = {
    name:            'Budi Santoso',
    email:           'budi@example.com',
    phone:           '081234567890',
    password:        'password123',
    confirmPassword: 'password123',
    userType:        'CUSTOMER' as const,
  };

  it('passes with all valid fields', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when name is empty', () => {
    expect(signupSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('fails when phone format is wrong (no 08 prefix)', () => {
    expect(signupSchema.safeParse({ ...valid, phone: '1234567890' }).success).toBe(false);
  });

  it('fails when phone is too short', () => {
    expect(signupSchema.safeParse({ ...valid, phone: '0812345' }).success).toBe(false);
  });

  it('passes with valid phone 08xx (10 digits)', () => {
    expect(signupSchema.safeParse({ ...valid, phone: '0812345678' }).success).toBe(true);
  });

  it('fails when passwords do not match', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((e) => e.path.join('.'));
      expect(paths).toContain('confirmPassword');
    }
  });

  it('fails when userType is not CUSTOMER or TUKANG', () => {
    expect(signupSchema.safeParse({ ...valid, userType: 'ADMIN' }).success).toBe(false);
  });

  it('passes with TUKANG userType', () => {
    expect(signupSchema.safeParse({ ...valid, userType: 'TUKANG' }).success).toBe(true);
  });
});

// ─── googleSignupSchema ───────────────────────────────────────────────────────

describe('googleSignupSchema', () => {
  it('passes with CUSTOMER userType and no phone', () => {
    expect(googleSignupSchema.safeParse({ userType: 'CUSTOMER' }).success).toBe(true);
  });

  it('passes with optional valid phone', () => {
    expect(googleSignupSchema.safeParse({ userType: 'TUKANG', phone: '081234567890' }).success).toBe(true);
  });

  it('fails when phone format is wrong but not empty', () => {
    expect(googleSignupSchema.safeParse({ userType: 'CUSTOMER', phone: 'abc' }).success).toBe(false);
  });

  it('passes when phone is empty string (treated as no phone)', () => {
    // empty string — refine returns true because !v is true
    expect(googleSignupSchema.safeParse({ userType: 'CUSTOMER', phone: '' }).success).toBe(true);
  });

  it('fails when userType is missing', () => {
    expect(googleSignupSchema.safeParse({ phone: '081234567890' }).success).toBe(false);
  });
});
