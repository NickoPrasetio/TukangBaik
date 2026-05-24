# Tukang Dashboard - Clean Architecture Implementation

## Struktur Layer

```
┌─ Presentation Layer (UI)
│  └─ src/app/tukang-dashboard/page.tsx
│  └─ src/components/features/tukang-dashboard/
│     ├─ TukangDashboardContent.tsx (hanya render UI)
│     └─ TukangNavbar.tsx
│
├─ Hook Layer (Business Logic Orchestration)
│  └─ src/hooks/useTukangDashboard.ts
│     ├─ State management
│     ├─ Callbacks untuk user interactions
│     └─ Use case integration
│
├─ Domain Layer (Business Rules)
│  └─ src/domain/tukang/usecases/
│     ├─ UpdateTukangStatusUseCase.ts
│     ├─ UpdateTukangSalaryUseCase.ts
│     ├─ UpdateTukangLocationUseCase.ts
│     └─ index.ts (barrel export)
│
└─ Data Layer (API Integration)
   └─ src/lib/api/
      └─ tukang.api.ts (API endpoints)
      └─ client.ts (HTTP client + patch method)
```

## Data Flow

```
User Input (Component)
       ↓
useTukangDashboard Hook (state + callbacks)
       ↓
Use Case Layer (business logic)
       ↓
tukang.api.ts (HTTP request)
       ↓
Backend API
```

### Contoh: Toggle "Menerima Pekerjaan"

1. **Component** (TukangDashboardContent.tsx)
   ```tsx
   <button onClick={toggleAccepting}>
     {isAccepting ? 'Menerima' : 'Tidak Menerima'}
   </button>
   ```

2. **Hook** (useTukangDashboard.ts)
   ```tsx
   const toggleAccepting = useCallback(async () => {
     const useCase = new UpdateTukangStatusUseCase();
     const result = await useCase.execute(newState, token);
     if (result.success) {
       setIsAccepting(newState);
     } else {
       setStatusError(result.error);
     }
   }, [isAccepting, token]);
   ```

3. **Use Case** (UpdateTukangStatusUseCase.ts)
   ```tsx
   async execute(isAvailable: boolean, token: string) {
     try {
       await tukangApi.updateStatus({ isAvailable }, token);
       return { success: true };
     } catch (err) {
       return { success: false, error: err.message };
     }
   }
   ```

4. **API** (tukang.api.ts)
   ```tsx
   updateStatus: (payload, token) =>
     apiClient.patch('/api/tukang/status', payload, token)
   ```

## Keuntungan Struktur Ini

✅ **Separation of Concerns** - Setiap layer punya tanggung jawab yang jelas
✅ **Testability** - Mudah di-unit test tanpa mocking component
✅ **Reusability** - Hook bisa digunakan di component lain
✅ **Maintainability** - Logic terpisah dari UI, mudah di-modify
✅ **Type Safety** - Strong typing di setiap layer
✅ **Error Handling** - Konsisten dengan Result pattern

## Files Structure

```
src/
├── app/
│   └── tukang-dashboard/
│       └── page.tsx (server component, wraps with TukangGuard)
│
├── components/features/
│   ├── auth/
│   │   ├── AuthGuard.tsx (updated: redirect tukang → /tukang-dashboard)
│   │   ├── SignupForm.tsx (updated: smart redirect)
│   │   └── TukangGuard.tsx (new: guard untuk tukang pages)
│   │
│   └── tukang-dashboard/
│       ├── TukangDashboardContent.tsx (new: clean, hanya render)
│       └── TukangNavbar.tsx (new: orange theme navbar)
│
├── domain/
│   └── tukang/usecases/
│       ├── UpdateTukangStatusUseCase.ts (new)
│       ├── UpdateTukangSalaryUseCase.ts (new)
│       ├── UpdateTukangLocationUseCase.ts (new)
│       └── index.ts (new: exports)
│
├── hooks/
│   └── useTukangDashboard.ts (new: orchestrates all logic)
│
└── lib/api/
    ├── client.ts (updated: added patch method)
    └── tukang.api.ts (new: API endpoints)
```

## API Endpoints (Untuk Backend)

```
PATCH /api/tukang/status
Body: { isAvailable: boolean }
Response: { success: boolean }

PATCH /api/tukang/salary
Body: { pricePerDay: number }
Response: { success: boolean }

PATCH /api/tukang/location
Body: { latitude: number, longitude: number }
Response: { success: boolean }
```

## Next Steps

1. Implementasikan endpoint-endpoint di backend Spring Boot
2. Sinkronisasi response type dengan backend
3. Add error toast notifications (optional)
4. Unit test use cases
5. Integration test dengan mock API
