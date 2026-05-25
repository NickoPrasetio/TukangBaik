import '@testing-library/jest-dom';

// ─── Polyfill fetch for jest-jsdom environment ────────────────────────────────
// jsdom does not expose a global fetch; use node-fetch v2 (CommonJS) so that
// MSW's @mswjs/interceptors can intercept the requests via ClientRequest patches.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodeFetch = require('node-fetch') as typeof import('node-fetch');
// @ts-expect-error — widening node-fetch types to match DOM fetch signatures
global.fetch    = nodeFetch.default ?? nodeFetch;
// @ts-expect-error
global.Headers  = nodeFetch.Headers;
// @ts-expect-error
global.Request  = nodeFetch.Request;
// @ts-expect-error
global.Response = nodeFetch.Response;

// ─── Mock next/navigation ─────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useRouter:       () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useParams:       () => ({}),
  useSearchParams: () => ({ get: jest.fn().mockReturnValue(null) }),
  usePathname:     () => '/',
}));

// ─── Mock next/dynamic ────────────────────────────────────────────────────────
jest.mock('next/dynamic', () => (fn: () => Promise<{ default: React.ComponentType }>) => {
  // Return a lazy component that renders nothing (e.g. MapPicker)
  const React = require('react');
  return function DynamicMock() { return React.createElement('div', { 'data-testid': 'dynamic-mock' }); };
});

// ─── Mock @react-oauth/google ─────────────────────────────────────────────────
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useGoogleLogin:      () => jest.fn(),
}));

// ─── Mock @greatsumini/react-facebook-login ───────────────────────────────────
jest.mock('@greatsumini/react-facebook-login', () => ({
  __esModule: true,
  default: ({ render }: { render: (props: object) => React.ReactNode }) =>
    render({ onClick: jest.fn() }),
}));

// ─── Mock navigator.geolocation ──────────────────────────────────────────────
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
  },
  configurable: true,
});

// ─── Silence console.error for expected errors in tests ──────────────────────
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('act('))
    ) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });
