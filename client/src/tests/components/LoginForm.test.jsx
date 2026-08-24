/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

jest.mock('../../hooks/useAuth', () => jest.fn());

const useAuth = require('../../hooks/useAuth');
const LoginForm = require('../../components/auth/LoginForm').default;

describe('LoginForm', () => {
  it('submits email and password through login', async () => {
    const login = jest.fn().mockResolvedValue({});
    const onSuccess = jest.fn();
    useAuth.mockReturnValue({ login });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(LoginForm, { onSuccess })
      );
    });

    const emailInput = tree.root.findByProps({ id: 'login-email' });
    const passwordInput = tree.root.findByProps({ id: 'login-password' });
    const form = tree.root.findByType('form');

    await act(async () => {
      emailInput.props.onChange({ target: { value: 'ada@example.com' } });
      passwordInput.props.onChange({ target: { value: 'secret12' } });
    });

    await act(async () => {
      await form.props.onSubmit({ preventDefault() {} });
    });

    expect(login).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'secret12',
    });
    expect(onSuccess).toHaveBeenCalled();
  });
});
