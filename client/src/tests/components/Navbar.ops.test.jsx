/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;
const { MemoryRouter } = require('react-router-dom');

jest.mock('../../hooks/useAuth', () => jest.fn());
jest.mock('../../hooks/useCart', () => jest.fn());

const useAuth = require('../../hooks/useAuth');
const useCart = require('../../hooks/useCart');
const Navbar = require('../../components/layout/Navbar').default;

describe('Navbar ops link', () => {
  beforeEach(() => {
    useCart.mockReturnValue({ itemCount: 0 });
  });

  it('shows Dashboard for staff and hides Inventory link', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Sam', role: 'staff' },
      logout: jest.fn(),
    });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(MemoryRouter, null, React.createElement(Navbar))
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('Dashboard');
    expect(body).not.toContain('Inventory');
    expect(body).not.toContain('"Staff"');
  });

  it('hides Dashboard for customers', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Ada', role: 'customer' },
      logout: jest.fn(),
    });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(MemoryRouter, null, React.createElement(Navbar))
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).not.toContain('Dashboard');
  });

  it('shows About link for guests', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(MemoryRouter, null, React.createElement(Navbar))
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('About');
    expect(body).toContain('/about');
  });
});
