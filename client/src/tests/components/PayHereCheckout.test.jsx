/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const PayHereCheckout =
  require('../../components/payments/PayHereCheckout').default;

describe('PayHereCheckout', () => {
  it('renders nothing without a session', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(React.createElement(PayHereCheckout));
    });
    expect(tree.toJSON()).toBeNull();
  });

  it('renders hidden PayHere fields for the checkout session', async () => {
    const session = {
      checkoutUrl: 'https://sandbox.payhere.lk/pay/checkout',
      merchant_id: 'm1',
      return_url: 'https://app/return',
      cancel_url: 'https://app/cancel',
      notify_url: 'https://api/notify',
      order_id: 'BF-1',
      items: 'Latte',
      amount: '4.32',
      currency: 'LKR',
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      phone: '',
      address: '',
      city: '',
      country: 'Sri Lanka',
      hash: 'abc123',
    };

    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(PayHereCheckout, { session })
      );
    });

    const form = tree.root.findByType('form');
    expect(form.props.action).toBe(session.checkoutUrl);
    expect(form.props.method).toBe('POST');

    expect(tree.root.findByProps({ name: 'hash' }).props.value).toBe('abc123');
    expect(tree.root.findByProps({ name: 'hash' }).props.type).toBe('hidden');
    expect(tree.root.findByProps({ name: 'merchant_id' }).props.value).toBe(
      'm1'
    );
    expect(tree.root.findByProps({ name: 'amount' }).props.value).toBe('4.32');
    expect(JSON.stringify(tree.toJSON())).toContain('PayHere');
  });
});
