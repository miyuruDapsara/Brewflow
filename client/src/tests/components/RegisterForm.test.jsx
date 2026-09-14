/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

jest.mock('../../hooks/useAuth', () => jest.fn());

const useAuth = require('../../hooks/useAuth');
const RegisterForm = require('../../components/auth/RegisterForm').default;

describe('RegisterForm', () => {
  it('submits name, email, and password through register', async () => {
    const register = jest.fn().mockResolvedValue({});
    const onSuccess = jest.fn();
    useAuth.mockReturnValue({ register });

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(RegisterForm, { onSuccess })
      );
    });

    const nameInput = tree.root.findByProps({ id: 'register-name' });
    const emailInput = tree.root.findByProps({ id: 'register-email' });
    const passwordInput = tree.root.findByProps({ id: 'register-password' });
    const form = tree.root.findByType('form');

    await act(async () => {
      nameInput.props.onChange({ target: { value: 'Ada' } });
      emailInput.props.onChange({ target: { value: 'ada@example.com' } });
      passwordInput.props.onChange({ target: { value: 'secret12' } });
    });

    await act(async () => {
      await form.props.onSubmit({ preventDefault() {} });
    });

    expect(register).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret12',
    });
    expect(onSuccess).toHaveBeenCalled();
  });
});
