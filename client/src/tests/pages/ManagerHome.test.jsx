/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;
const { MemoryRouter } = require('react-router-dom');

const ManagerHome = require('../../pages/manager/ManagerHome').default;

describe('ManagerHome', () => {
  it('renders dashboard links', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(ManagerHome)
        )
      );
    });
    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('Dashboard');
    expect(body).toContain('Kitchen');
    expect(body).toContain('Inventory');
    expect(body).toContain('Reports');
    expect(body).toContain('Audit');
  });
});
