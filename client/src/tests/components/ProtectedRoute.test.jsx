/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

jest.mock('../../hooks/useAuth', () => jest.fn());

jest.mock('react-router-dom', () => {
  const ReactLocal = require('react');
  return {
    Navigate: ({ to }) =>
      ReactLocal.createElement('div', null, `navigate:${to}`),
    useLocation: () => ({ pathname: '/account' }),
  };
});

const useAuth = require('../../hooks/useAuth');
const ProtectedRoute = require('../../components/common/ProtectedRoute').default;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuth.mockReset();
  });

  it('renders children when authenticated', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'customer' },
      loading: false,
    });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          ProtectedRoute,
          null,
          React.createElement('div', null, 'secret')
        )
      );
    });

    expect(tree.root.findByType('div').children).toContain('secret');
  });

  it('redirects unauthenticated users to login', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          ProtectedRoute,
          null,
          React.createElement('div', null, 'secret')
        )
      );
    });

    expect(tree.root.findByType('div').children).toContain('navigate:/login');
  });

  it('redirects wrong roles to unauthorized', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'customer' },
      loading: false,
    });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          ProtectedRoute,
          { roles: ['manager'] },
          React.createElement('div', null, 'secret')
        )
      );
    });

    expect(tree.root.findByType('div').children).toContain(
      'navigate:/unauthorized'
    );
  });
});
