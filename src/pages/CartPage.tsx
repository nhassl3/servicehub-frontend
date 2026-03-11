import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ordersApi } from '../api/orders'
import { useCart } from '../context/CartContext'
import './CartPage.css'

const DEBOUNCE_MS = 400;

export function CartPage() {
  const { t } = useTranslation();
  const { cart, itemCount, removeItem, updateQty, isLoading } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  // Per-product optimistic quantities & debounce timers
  const [pendingQty, setPendingQty] = useState<Map<string, number>>(new Map());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => { timers.forEach(t => clearTimeout(t)); };
  }, []);

  const handleQtyChange = useCallback((productId: string, newQty: number) => {
    setPendingQty(prev => new Map(prev).set(productId, newQty));

    const existing = timersRef.current.get(productId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      timersRef.current.delete(productId);
      try {
        await updateQty(productId, newQty);
      } finally {
        setPendingQty(prev => {
          const next = new Map(prev);
          next.delete(productId);
          return next;
        });
      }
    }, DEBOUNCE_MS);

    timersRef.current.set(productId, timer);
  }, [updateQty]);

  const flushPending = useCallback(async () => {
    const promises: Promise<void>[] = [];
    for (const [productId, timer] of timersRef.current) {
      clearTimeout(timer);
      timersRef.current.delete(productId);
      const qty = pendingQty.get(productId);
      if (qty != null) {
        promises.push(
          updateQty(productId, qty).finally(() =>
            setPendingQty(prev => { const n = new Map(prev); n.delete(productId); return n; })
          )
        );
      }
    }
    await Promise.all(promises);
  }, [pendingQty, updateQty]);

  const handleCheckout = async () => {
    setError('');
    setCheckingOut(true);
    try {
      await flushPending();
      const { order } = await ordersApi.create();
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message?.toLocaleUpperCase() ?? t('cart.checkoutFailed'));
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
        <h1 className="page-title">{t('cart.title')}</h1>
        <div className="card cart-empty__card">
          <p className="text-muted">{t('cart.empty')}</p>
          <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('cart.browseProducts')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">{t('cart.title')}</h1>

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
                  ${item.unit_price.toFixed(2)} {t('cart.each')}
                </span>
              </div>

              <div className="cart-item__controls">
                {(() => {
                  const displayQty = pendingQty.get(item.product_id) ?? item.quantity;
                  return (
                    <div className="cart-item__qty">
                      <button
                        className="qty-btn"
                        onClick={() => handleQtyChange(item.product_id, Math.max(1, displayQty - 1))}
                        disabled={displayQty <= 1}
                      >−</button>
                      <span className="qty-value">{displayQty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleQtyChange(item.product_id, Math.min(10, displayQty + 1))}
                        disabled={displayQty >= 10}
                      >+</button>
                    </div>
                  );
                })()}

                <span className="cart-item__total">
                  ${((pendingQty.get(item.product_id) ?? item.quantity) * item.unit_price).toFixed(2)}
                </span>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(item.product_id)}
                >
                  {t('cart.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary ───────────────────────────────────────────────────────── */}
        <div className="cart-summary card">
          <h2 className="cart-summary__title">{t('cart.orderSummary')}</h2>
          {(() => {
            const optimisticSubtotal = cart.items.reduce((sum, item) => {
              const qty = pendingQty.get(item.product_id) ?? item.quantity;
              return sum + qty * item.unit_price;
            }, 0);
            return (
              <>
                <div className="cart-summary__row">
                  <span className="text-muted">{t('cart.items', { count: cart.items.length })}</span>
                  <span>${optimisticSubtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary__divider" />
                <div className="cart-summary__row cart-summary__total">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary">${optimisticSubtotal.toFixed(2)}</span>
                </div>
              </>
            );
          })()}

          {error && <div className="auth-error flex-center" style={{ marginTop: '1rem' }}>{error}</div>}

          <button
            className="btn btn-primary cart-summary__checkout"
            onClick={handleCheckout}
            disabled={checkingOut || pendingQty.size > 0}
          >
            {checkingOut ? t('cart.processing') : t('cart.checkout')}
          </button>
        </div>
      </div>
    </div>
  );
}
