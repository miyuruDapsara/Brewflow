import { useEffect, useRef } from 'react';

/**
 * Hidden form that auto-submits to PayHere Checkout with server-built fields.
 */
export default function PayHereCheckout({ session }) {
  const formRef = useRef(null);

  useEffect(() => {
    if (session?.checkoutUrl && formRef.current) {
      formRef.current.submit();
    }
  }, [session]);

  if (!session) {
    return null;
  }

  const fields = [
    'merchant_id',
    'return_url',
    'cancel_url',
    'notify_url',
    'order_id',
    'items',
    'amount',
    'currency',
    'first_name',
    'last_name',
    'email',
    'phone',
    'address',
    'city',
    'country',
    'hash',
  ];

  return (
    <div className="bf-glass-strong space-y-3 rounded-2xl p-6 text-center">
      <p className="text-sm text-[var(--bf-muted)]">
        Redirecting to PayHere secure checkout…
      </p>
      <form
        ref={formRef}
        method="POST"
        action={session.checkoutUrl}
        acceptCharset="utf-8"
      >
        {fields.map((name) => (
          <input
            key={name}
            type="hidden"
            name={name}
            value={session[name] ?? ''}
          />
        ))}
        <noscript>
          <button type="submit">Continue to PayHere</button>
        </noscript>
      </form>
    </div>
  );
}
