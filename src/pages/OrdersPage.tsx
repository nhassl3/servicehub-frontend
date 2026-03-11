import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ordersApi } from '../api/orders'
import type { Order } from '../types'
import './OrdersPage.css'

const STATUS_CLASS: Record<string, string> = {
  pending:   'badge-warning',
  paid:      'badge-success',
  delivered: 'badge-primary',
  cancelled: 'badge-error',
};

export function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 10;

  useEffect(() => {
    setLoading(true);
    ordersApi.list({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
      .then(d => { setOrders(d.orders ?? []); setTotal(d.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">{t('orders.title')}</h1>

      {orders.length === 0 ? (
        <div className="card orders-empty">
          <p className="text-muted">{t('orders.noOrders')}</p>
          <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('orders.browseProducts')}
          </Link>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map(order => (
              <Link key={order.id} to={`/orders/${order.id}`} className="order-card card">
                <div className="order-card__header">
                  <div>
                    <div className="order-card__uid text-muted">#{order.uid}</div>
                    <div className="order-card__date text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_CLASS[order.status] ?? 'badge-primary'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-card__footer">
                  <span className="text-muted">{t('orders.item', { count: order.items?.length || 0 })}</span>
                  <span className="order-card__total">${order.total_amount.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="catalog__pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >{t('orders.prev')}</button>
              <span className="text-muted">{page + 1} / {totalPages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >{t('orders.next')}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
