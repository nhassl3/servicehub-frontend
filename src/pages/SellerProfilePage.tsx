import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { productsApi } from '../api/products'
import { sellersApi } from '../api/sellers'
import { ProductCard } from '../components/product/ProductCard'
import { useAuth } from '../context/AuthContext'
import type { Product, Seller } from '../types'
import './SellerProfilePage.css'

export function SellerProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { username } = useParams<{ username: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    sellersApi.getProfileByUsername(username).then(async ({ seller }) => {
      setSeller(seller);
      const { products } = await productsApi.list({
        seller_id: seller.id,
        limit: 12,
        offset: 0,
      });
      setProducts(products ?? []);
    }).finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container section">
        <div className="card">
            <p className="text-muted">{t('sellerProfile.sellerNotFound')}</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('sellerProfile.goHome')}</Link>
        </div>
      </div>
    );
  }

  const stars = '★'.repeat(Math.round(seller.rating || 0)) + '☆'.repeat(5 - Math.round(seller.rating || 0));
  const initials = seller.display_name.slice(0, 2).toUpperCase();

  return (
    <div className="container section">
      {/* ── Seller Header ──────────────────────────────────────────────────── */}
      <div className="card seller-profile-header">
        <div className="seller-profile-avatar">
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt={seller.display_name} className="seller-profile-avatar__img" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="seller-profile-info">
          <h1 className="seller-profile-info__name">{seller.display_name}</h1>
          <div className="seller-profile-info__username text-muted">@{seller.username}</div>
          {seller.description && (
            <p className="seller-profile-info__description text-muted">{seller.description}</p>
          )}
          <div className="seller-profile-info__stats">
            <div className="seller-stat">
              <span className="seller-stat__stars">{stars}</span>
              <span className="text-muted seller-stat__label">
                {seller.rating ? seller.rating.toFixed(1) : 0} {t('seller.rating')}
              </span>
            </div>
            <div className="seller-stat">
              <span className="seller-stat__value">{seller.total_sales || 0}</span>
              <span className="text-muted seller-stat__label">{t('sellerProfile.totalSales')}</span>
            </div>
            <div className="seller-stat">
              <span className="seller-stat__value">{products.length}</span>
              <span className="text-muted seller-stat__label">{t('sellerProfile.products')}</span>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {user?.username === username && (
            <Link to="/seller/dashboard" className="btn btn-primary">
              {t('sellerProfile.manageStore')}
            </Link>
          )}
        </div>
      </div>

      {/* ── Products ───────────────────────────────────────────────────────── */}
      <h2 className="seller-products-title">{t('sellerProfile.productsByTitle', { name: seller.display_name })}</h2>
      {products.length === 0 ? (
        <div className="card orders-empty">
          <p className="text-muted">{t('sellerProfile.noProducts')}</p>
        </div>
      ) : (
        <div className="grid-products">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
