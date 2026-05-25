import { useAuthStore } from '@/store/authStore';
import { MOCK_USER, MOCK_TOKEN } from '../../setup/handlers';

// Reset store state before each test
beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false });
});

describe('authStore', () => {
  describe('setSession', () => {
    it('sets user, token, and isAuthenticated=true', () => {
      useAuthStore.getState().setSession(MOCK_USER, MOCK_TOKEN);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(MOCK_USER);
      expect(state.token).toBe(MOCK_TOKEN);
      expect(state.isAuthenticated).toBe(true);
    });

    it('sets isAdmin=true when role is ROLE_ADMIN', () => {
      const adminUser = { ...MOCK_USER, role: 'ROLE_ADMIN' };
      useAuthStore.getState().setSession(adminUser, MOCK_TOKEN);
      expect(useAuthStore.getState().isAdmin).toBe(true);
    });

    it('sets isAdmin=false when role is ROLE_USER', () => {
      useAuthStore.getState().setSession({ ...MOCK_USER, role: 'ROLE_USER' }, MOCK_TOKEN);
      expect(useAuthStore.getState().isAdmin).toBe(false);
    });
  });

  describe('clearSession', () => {
    it('resets all auth state', () => {
      useAuthStore.getState().setSession(MOCK_USER, MOCK_TOKEN);
      useAuthStore.getState().clearSession();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
    });
  });

  describe('setUser', () => {
    it('partially updates user fields', () => {
      useAuthStore.getState().setSession(MOCK_USER, MOCK_TOKEN);
      useAuthStore.getState().setUser({ name: 'New Name' });
      expect(useAuthStore.getState().user?.name).toBe('New Name');
      // Other fields preserved
      expect(useAuthStore.getState().user?.email).toBe(MOCK_USER.email);
    });

    it('does nothing when user is null', () => {
      useAuthStore.getState().setUser({ name: 'Should not crash' });
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
