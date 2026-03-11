import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import type { Order } from '../types';
import './OrdersPage.css';

const STATUS_CLASS: Record<string, string> = {
  pending:   'badge-warning',
  paid:      'badge-success',
  delivered: 'badge-primary',
  cancelled: 'badge-error',
};

export function OrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    ordersApi.get(id)
      .then(d => setOrder(d.order))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!id || !order) return;
    setCancelling(true);
    try {
      const { order: updated } = await ordersApi.cancel(id);
      setOrder(updated);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container section">
        <p className="text-muted">{t('orderDetail.notFound')}</p>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('orderDetail.backToOrders')}</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <Link to="/orders" className="product-detail__back text-muted">{t('orderDetail.backToOrders')}</Link>
      <h1 className="page-title">{t('orderDetail.title')}</h1>

      <div className="cart-layout">
        {/* ── Items ─────────────────────────────────────────────────────────── */}
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div className="text-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  #{order.uid}
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {t('orderDetail.placed', { date: new Date(order.created_at).toLocaleString() })}
                </div>
              </div>
              <span className={`badge ${STATUS_CLASS[order.status] ?? 'badge-primary'}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{t('orderDetail.items')}</h2>
            {order.items.map(item => (
              <div key={item.id} className="profile-field">
                <div>
                  <Link to={`/products/${item.product_id}`} className="text-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                    Product #{item.product_id.slice(0, 8)}…
                  </Link>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {item.quantity} × ${item.unit_price.toFixed(2)}
                  </div>
                </div>
                <span style={{ fontWeight: 600 }}>${item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Summary ───────────────────────────────────────────────────────── */}
        <div className="cart-summary card">
          <h2 className="cart-summary__title">{t('orderDetail.summary')}</h2>
          <div className="cart-summary__row">
            <span className="text-muted">{t('orderDetail.items')}</span>
            <span>{order.items.length}</span>
          </div>
          <div className="cart-summary__divider" />
          <div className="cart-summary__row cart-summary__total">
            <span>{t('orderDetail.total')}</span>
            <span className="text-primary">${order.total_amount.toFixed(2)}</span>
          </div>

          {order.status === 'pending' && (
            <button
              className="btn btn-danger"
              style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? t('orderDetail.cancelling') : t('orderDetail.cancelOrder')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
