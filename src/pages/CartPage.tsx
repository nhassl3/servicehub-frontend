import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ordersApi } from '../api/orders'
import { useCart } from '../context/CartContext'
import './CartPage.css'

export function CartPage() {
  const { cart, itemCount, removeItem, updateQty, isLoading } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setError('');
    setCheckingOut(true);
    try {
      const { order } = await ordersApi.create();
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="container section cart-empty">
        <h1 className="page-title">Your Cart</h1>
        <div className="card cart-empty__card"> 
          <p className="text-muted">Your cart is empty.</p>
          <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">Your Cart</h1>

      <div className="cart-layout">
        {/* ── Items ─────────────────────────────────────────────────────────── */}
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.id} className="cart-item card">
              <div className="cart-item__info">
                <Link to={`/products/${item.product_id}`} className="cart-item__id text-primary">
                  Product #{item.product_id.slice(0, 8)}…
                </Link>
                <span className="cart-item__price text-muted">
                  ${item.unit_price.toFixed(2)} each
                </span>
              </div>

              <div className="cart-item__controls">
                <div className="cart-item__qty">
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.product_id, Math.max(1, item.quantity - 1))}
                  >−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.product_id, item.quantity + 1)}
                  >+</button>
                </div>

                <span className="cart-item__total">
                  ${item.total_price.toFixed(2)}
                </span>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(item.product_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary ───────────────────────────────────────────────────────── */}
        <div className="cart-summary card">
          <h2 className="cart-summary__title">Order Summary</h2>
          <div className="cart-summary__row">
            <span className="text-muted">Items ({cart.items.length})</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary__divider" />
          <div className="cart-summary__row cart-summary__total">
            <span>Total</span>
            <span className="text-primary">${cart.subtotal.toFixed(2)}</span>
          </div>

          {error && <div className="auth-error" style={{ marginTop: '1rem' }}>{error}</div>}

          <button
            className="btn btn-primary cart-summary__checkout"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? 'Processing…' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
