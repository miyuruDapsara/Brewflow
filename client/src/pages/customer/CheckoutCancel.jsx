import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import PaymentResult from '../../components/payments/PaymentResult';

export default function CheckoutCancel() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <section className="bf-page mx-auto max-w-xl space-y-4">
      <PaymentResult
        status="cancelled"
        orderId={orderId || undefined}
        message="You left PayHere before completing payment. You can try again from checkout."
      />
      <div className="flex justify-center gap-3">
        <Link to="/checkout">
          <Button>Try again</Button>
        </Link>
        <Link to="/menu">
          <Button variant="secondary">Menu</Button>
        </Link>
      </div>
    </section>
  );
}
