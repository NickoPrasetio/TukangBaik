import { rest } from 'msw';

const BASE = 'http://localhost:8080';

// ─── Fixture data ─────────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: 'user-123',
  name: 'Budi Santoso',
  email: 'budi@example.com',
  phone: '081234567890',
  role: 'ROLE_USER',
  userType: 'CUSTOMER',
  avatar: null,
};

export const MOCK_TOKEN = 'mock-jwt-token';

export const MOCK_WORKER = {
  id: 'worker-1',
  name: 'Rizky Pratama',
  avatar: 'https://example.com/avatar.jpg',
  age: 30,
  experience: 5,
  rating: 4.5,
  totalReviews: 20,
  specializations: ['Plumbing', 'Electric'],
  location: 'Jakarta',
  pricePerDay: 150000,
  isAvailable: true,
  workStatus: 'OPEN',
  bio: 'Tukang berpengalaman',
  reviews: [],
};

export const MOCK_BOOKING = {
  id: 'booking-1',
  workerId: 'worker-1',
  workerName: 'Rizky Pratama',
  workerAvatar: null,
  customerId: 'user-123',
  customerName: 'Budi Santoso',
  address: 'Jl. Contoh No. 1',
  city: 'Jakarta',
  latitude: -6.2,
  longitude: 106.816,
  bookingDate: '2026-05-25',
  startTime: '08:00',
  durationDays: 2,
  paymentMethod: 'CASH',
  status: 'PENDING',
  notes: 'Perbaikan atap bocor',
  createdAt: '2026-05-25T08:00:00',
};

// ─── Handlers (MSW v1 syntax) ─────────────────────────────────────────────────

export const handlers = [

  // ── Auth ──────────────────────────────────────────────────────────────────

  rest.post(`${BASE}/api/auth/login`, async (req, res, ctx) => {
    const body = await req.json();
    if (body.email === 'budi@example.com' && body.password === 'password123') {
      return res(ctx.json({ ...MOCK_USER, token: MOCK_TOKEN }));
    }
    return res(ctx.status(401), ctx.json({ error: 'Email atau password salah' }));
  }),

  rest.post(`${BASE}/api/auth/register`, async (req, res, ctx) => {
    const body = await req.json();
    if (body.email === 'taken@example.com') {
      return res(ctx.status(409), ctx.json({ error: 'Email sudah terdaftar' }));
    }
    return res(ctx.status(201), ctx.json({ ...MOCK_USER, token: MOCK_TOKEN }));
  }),

  rest.post(`${BASE}/api/auth/google`, async (req, res, ctx) => {
    const body = await req.json();
    if (body.accessToken === 'existing-google-token') {
      return res(ctx.json({ newUser: false, ...MOCK_USER, token: MOCK_TOKEN }));
    }
    return res(ctx.json({ newUser: true, name: 'Google User', email: 'google@example.com', avatar: null }));
  }),

  rest.post(`${BASE}/api/auth/google/complete`, (_req, res, ctx) =>
    res(ctx.json({ ...MOCK_USER, token: MOCK_TOKEN })),
  ),

  rest.post(`${BASE}/api/auth/facebook`, async (req, res, ctx) => {
    const body = await req.json();
    if (body.accessToken === 'existing-fb-token') {
      return res(ctx.json({ newUser: false, ...MOCK_USER, token: MOCK_TOKEN }));
    }
    return res(ctx.json({ newUser: true, name: 'FB User', email: 'fb@example.com', avatar: null }));
  }),

  rest.post(`${BASE}/api/auth/facebook/complete`, (_req, res, ctx) =>
    res(ctx.json({ ...MOCK_USER, token: MOCK_TOKEN })),
  ),

  rest.get(`${BASE}/api/auth/me`, (_req, res, ctx) =>
    res(ctx.json({ ...MOCK_USER, token: MOCK_TOKEN })),
  ),

  rest.put(`${BASE}/api/auth/me`, async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({ ...MOCK_USER, ...body, token: MOCK_TOKEN }));
  }),

  // ── Workers ───────────────────────────────────────────────────────────────

  rest.get(`${BASE}/api/workers`, (_req, res, ctx) =>
    res(ctx.json([MOCK_WORKER])),
  ),

  rest.get(`${BASE}/api/workers/:id`, (req, res, ctx) => {
    if (req.params.id === 'worker-1') return res(ctx.json(MOCK_WORKER));
    return res(ctx.status(404), ctx.json({ error: 'Tukang tidak ditemukan' }));
  }),

  rest.post(`${BASE}/api/workers`, (_req, res, ctx) =>
    res(ctx.status(201), ctx.json(MOCK_WORKER)),
  ),

  // ── Bookings ──────────────────────────────────────────────────────────────

  rest.post(`${BASE}/api/bookings`, (_req, res, ctx) =>
    res(ctx.status(201), ctx.json(MOCK_BOOKING)),
  ),

  rest.get(`${BASE}/api/bookings/my`, (_req, res, ctx) =>
    res(ctx.json([MOCK_BOOKING])),
  ),

  rest.get(`${BASE}/api/bookings/my-orders`, (_req, res, ctx) =>
    res(ctx.json([MOCK_BOOKING])),
  ),

  rest.get(`${BASE}/api/bookings/server-time`, (_req, res, ctx) =>
    res(ctx.json({ date: '2026-05-25', dateTime: '2026-05-25T08:00:00' })),
  ),

  rest.get(`${BASE}/api/bookings/:id`, (req, res, ctx) => {
    if (req.params.id === 'booking-1') return res(ctx.json(MOCK_BOOKING));
    return res(ctx.status(404), ctx.json({ error: 'Booking tidak ditemukan' }));
  }),

  rest.patch(`${BASE}/api/bookings/:id/confirm`, (req, res, ctx) => {
    if (req.params.id === 'booking-1') {
      return res(ctx.json({ ...MOCK_BOOKING, status: 'CONFIRMED' }));
    }
    return res(ctx.status(404), ctx.json({ error: 'Booking tidak ditemukan' }));
  }),

  // ── Reviews ───────────────────────────────────────────────────────────────

  rest.get(`${BASE}/api/reviews`, (_req, res, ctx) =>
    res(ctx.json([
      { id: 'review-1', userId: 'user-123', userName: 'Budi', rating: 5, comment: 'Bagus!', date: '2026-05-20' },
    ])),
  ),

  rest.post(`${BASE}/api/reviews`, (_req, res, ctx) =>
    res(ctx.status(201), ctx.json({ id: 'review-2', userId: 'user-123', userName: 'Budi', rating: 4, comment: 'Ok', date: '2026-05-25' })),
  ),

  // ── Tukang ────────────────────────────────────────────────────────────────

  rest.get(`${BASE}/api/tukang/profile`, (_req, res, ctx) =>
    res(ctx.json(MOCK_WORKER)),
  ),

  rest.patch(`${BASE}/api/tukang/status`, (_req, res, ctx) =>
    res(ctx.json({ ...MOCK_WORKER, workStatus: 'CLOSED' })),
  ),

  rest.patch(`${BASE}/api/tukang/salary`, (_req, res, ctx) =>
    res(ctx.json({ ...MOCK_WORKER, pricePerDay: 200000 })),
  ),

  rest.patch(`${BASE}/api/tukang/location`, (_req, res, ctx) =>
    res(ctx.json(MOCK_WORKER)),
  ),
];
