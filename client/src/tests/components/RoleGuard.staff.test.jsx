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
  };
});

const useAuth = require('../../hooks/useAuth');
const RoleGuard = require('../../components/auth/RoleGuard').default;

describe('RoleGuard staff access', () => {
  beforeEach(() => {
    useAuth.mockReset();
  });

  it('allows staff into the kitchen dashboard', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'staff' },
      loading: false,
    });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          RoleGuard,
          { roles: ['staff', 'manager'] },
          React.createElement('div', null, 'kitchen')
        )
      );
    });

    expect(JSON.stringify(tree.toJSON())).toContain('kitchen');
  });

  it('blocks customers from staff routes', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'customer' },
      loading: false,
    });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          RoleGuard,
          { roles: ['staff', 'manager'] },
          React.createElement('div', null, 'kitchen')
        )
      );
    });

    expect(JSON.stringify(tree.toJSON())).toContain('navigate:/unauthorized');
  });
});
