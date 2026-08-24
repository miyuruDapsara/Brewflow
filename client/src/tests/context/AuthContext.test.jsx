/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

jest.mock('../../services/auth', () => ({
  login: jest.fn(),
  register: jest.fn(),
  me: jest.fn(),
}));

const authService = require('../../services/auth');
const { AuthProvider } = require('../../context/AuthContext');
const useAuth = require('../../hooks/useAuth').default;
const { STORAGE_KEYS } = require('../../utils/constants');

function Probe({ onValue }) {
  const value = useAuth();
  React.useEffect(() => {
    onValue(value);
  }, [value, onValue]);
  return null;
}

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    authService.login.mockReset();
    authService.register.mockReset();
    authService.me.mockReset();
  });

  it('logs in, stores the token, and exposes the user', async () => {
    authService.login.mockResolvedValue({
      token: 'tok-1',
      user: { id: '1', name: 'Ada', email: 'ada@example.com', role: 'customer' },
    });

    let latest;
    await act(async () => {
      TestRenderer.create(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(Probe, {
            onValue: (value) => {
              latest = value;
            },
          })
        )
      );
    });

    await act(async () => {
      await latest.login({ email: 'ada@example.com', password: 'secret12' });
    });

    expect(window.localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('tok-1');
    expect(latest.isAuthenticated).toBe(true);
    expect(latest.user.name).toBe('Ada');

    await act(async () => {
      latest.logout();
    });

    expect(window.localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(latest.isAuthenticated).toBe(false);
  });
});
