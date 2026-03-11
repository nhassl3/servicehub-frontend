import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../api/wishlist';
import type { WishlistItem } from '../types';
import './WishlistPage.css';

export function WishlistPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistApi.get()
      .then(d => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    await wishlistApi.remove(productId);
    setItems(prev => prev.filter(i => i.product_id !== productId));
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">{t('wishlistPage.title')}</h1>

      {items.length === 0 ? (
        <div className="card orders-empty">
          <p className="text-muted">{t('wishlistPage.empty')}</p>
          <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('wishlistPage.browseProducts')}
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map(item => (
            <div key={item.id} className="card wishlist-item">
              <Link to={`/products/${item.product_id}`} className="wishlist-item__id text-primary">
                Product #{item.product_id.slice(0, 8)}…
              </Link>
              <span className="text-muted wishlist-item__date">
                {t('wishlistPage.added', { date: new Date(item.created_at).toLocaleDateString() })}
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRemove(item.product_id)}
              >
                {t('wishlistPage.remove')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
