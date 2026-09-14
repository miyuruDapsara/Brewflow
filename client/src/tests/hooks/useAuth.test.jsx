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

const { AuthProvider } = require('../../context/AuthContext');
const useAuth = require('../../hooks/useAuth').default;

function Probe({ onValue }) {
  const value = useAuth();
  React.useEffect(() => {
    onValue(value);
  }, [value, onValue]);
  return null;
}

describe('useAuth', () => {
  it('exposes AuthContext values when wrapped in AuthProvider', async () => {
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

    expect(latest).toMatchObject({
      isAuthenticated: false,
      user: null,
    });
    expect(typeof latest.login).toBe('function');
    expect(typeof latest.register).toBe('function');
    expect(typeof latest.logout).toBe('function');
  });
});
