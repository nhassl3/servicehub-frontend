import { useEffect, useRef, useState } from 'react'
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // useEffect to close upload modal on Escape key press
  // working when modal is open and not when it's closing to prevent conflicts
  // with the closing animation
  useEffect(() => {
    if (!showUploadModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUploadModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showUploadModal]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const handleUploadAvatar = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!avatarFile) return;
    setUploadError('');
    setUploadSuccess('');
    setUploadingAvatar(true);
    try {
      const { seller: updated } = await sellersApi.uploadAvatar(avatarFile);
      setSeller(updated);
      setUploadSuccess(t('seller.avatarChanged'));
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err?.response?.data?.message.toUpperCase() ?? t('seller.failedUploadAvatar'));
    } finally {
      setUploadingAvatar(false);
      window.location.reload();
    }
  };

   const closeUploadModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setModalClosing(false);
      setAvatarFile(null);
      setUploadError('');
      setUploadSuccess('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 200);
  };

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
        {user?.username === username ? (
          <button className="profile-avatar m0" onClick={() => setShowUploadModal(true)}>
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt={seller.display_name} className="profile-avatar__img" />
          ) : (
            <span>{initials}</span>
          )}
        </button>
        ) : (
          <div className="profile-avatar m0">
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt={seller.display_name} className="profile-avatar__img" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        )}
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

      {/* ── Upload Avatar Modal ─────────────────────────────────────────── */}
      {showUploadModal && (
        <div className={`modal-overlay${modalClosing ? ' closing' : ''}`} onClick={closeUploadModal}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('seller.uploadAvatarTitle')}</h2>
              <button className="modal-close" onClick={closeUploadModal}>&times;</button>
            </div>
            {uploadError && <div className="auth-error flex-center">{uploadError.toUpperCase()}</div>}
            {uploadSuccess && <div className="success flex-center">{uploadSuccess.toUpperCase()}</div>}
            <form onSubmit={handleUploadAvatar} className="auth-form">
              <div className="form-group">
                <label className="form-label">{t('seller.selectAvatar')}</label>
                <input
                  ref={fileInputRef}
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={e => setAvatarFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" type="submit" disabled={uploadingAvatar || !avatarFile}>
                  {uploadingAvatar ? t('seller.uploadingAvatar') : t('seller.uploadAvatar')}
                </button>
                <button className="btn btn-secondary" type="button" onClick={closeUploadModal}>
                  {t('seller.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
