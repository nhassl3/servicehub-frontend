import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GoHeartFill } from "react-icons/go"
import { Link, useParams } from 'react-router-dom'
import { productsApi } from '../api/products'
import { reviewsApi } from '../api/reviews'
import { sellersApi } from '../api/sellers'
import { wishlistApi } from '../api/wishlist'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { Product, Review, Seller } from '../types'
import './ProductDetailPage.css'

export function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { productInCart, addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [inCart, setInCart] = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Effect 1: public data — product, seller, reviews.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);

    productsApi.get(id).then(({ product }) => {
      if (cancelled) return;
      setProduct(product);
      setRating(product.rating);
      sellersApi.getProfileByUUID(product.seller_id).catch(() => null).then(d => {
        if (!cancelled && d) setSeller(d.seller);
      });
    });

    reviewsApi.list(id, { limit: 20 }).then(d => {
      if (cancelled) return;
      setReviews(d.reviews ?? []);
      setReviewTotal(d.total);
    }).finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  // Effect 2: wishlist — auth-gated
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    let cancelled = false;
    wishlistApi.exists(id).then(d => {
      if (cancelled || !d?.in_wishlist) return;
      setInWishlist(d.in_wishlist);
    });
    return () => { cancelled = true; };
  }, [id, isAuthenticated]);

  // Effect 3: cart status
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    productInCart(id)
    .then(inCart => {
      if (cancelled) return;
      setInCart(inCart);
    }).catch(() => {
      setInCart(false)
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addItem(product.id);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    try {
      await wishlistApi.add(product.id);
      setInWishlist(true);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? 'Failed to add to wishlist');
    }
  };

  const handleReviewSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!id || !product) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      const { review } = await reviewsApi.create(id, reviewForm);
      setReviews(prev => [review, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      setRating(prev => (Number(prev || 0) * Number(reviewTotal) + Number(review.rating)) / (Number(reviewTotal) + Number(1)));
      setReviewTotal(prev => Number(prev || 0) + Number(1));
    } catch (err: any) {
      setReviewError(err?.response?.data?.error ?? 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section">
        <div className="card"> <p className="text-muted">{t('product.notFound')}</p>
        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('product.backToCatalog')}</Link></div>
      </div>
    );
  }

  const stars = (rating: number) =>
    '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <div className="container section">
      <Link to="/catalog" className="product-detail__back text-muted">{t('product.backToCatalog')}</Link>

      <div className="product-detail__layout">
        {/* ── Main Info ────────────────────────────────────────────────────── */}
        <div>
          <div className="card product-detail__main">
            <div className="product-detail__tags">
              {product.tags.map((tag, index) => (
                <span key={index} className="badge badge-primary">{tag}</span>
              ))}
            </div>

            <h1 className="product-detail__title">{product.title}</h1>

            <div className="product-detail__meta">
              <div className="product-detail__rating">
                <span className="product-detail__stars">{stars(rating || 0)}</span>
                <span className="text-muted">({reviewTotal || 0} reviews)</span>
              </div>
              <span className="badge badge-success">{t('product.sold', { count: product.sales_count || 0 })}</span>
            </div>

            <div className="product-detail__description">
              {product.description.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {/* ── Reviews ───────────────────────────────────────────────────── */}
          <div className="card product-detail__reviews">
            <h2 className="product-detail__section-title">
              {t('product.reviews', { count: reviewTotal || 0 })}
            </h2>

            {isAuthenticated && (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <h3 className="review-form__title">{t('product.writeReview')}</h3>
                {reviewError && <div className="auth-error">{reviewError}</div>}
                <div className="review-form__rating">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`review-star-btn${r <= reviewForm.rating ? ' active' : ''}`}
                      onClick={() => setReviewForm(f => ({ ...f, rating: r }))}
                    >★</button>
                  ))}
                </div>
                <textarea
                  className="input review-form__comment"
                  placeholder={t('product.shareExperience')}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={3}
                />
                <button className="btn btn-primary" type="submit" disabled={submittingReview}>
                  {submittingReview ? t('product.submitting') : t('product.submitReview')}
                </button>
              </form>
            )}

            <div className="review-list">
              {reviews.length === 0 ? (
                <p className="text-muted">{t('product.noReviews')}</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-item__header">
                      <span className="review-item__author">{review.username}</span>
                      <span className="review-item__stars">{stars(review.rating)}</span>
                    </div>
                    <p className="review-item__comment">{review.comment}</p>
                    <span className="review-item__date text-muted">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="product-detail__sidebar">
          <div className="card product-detail__buy">
            <div className="product-detail__price">${product.price.toFixed(2)}</div>

            {isAuthenticated ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {
                  inCart ? (
                    <Link to="/cart" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                      {t('product.viewCart')}
                    </Link>
                  ) : (
                    <>
                      <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? t('product.adding') : t('product.addToCart')}
                  </button>
                  <button className='btn btn-outline' onClick={handleAddToWishlist}>
                      <GoHeartFill size={32} color={inWishlist ? "#38BDF8" : "gray"} />
                  </button>
                    </>
                  )
                }
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                {t('product.loginToBuy')}
              </Link>
            )}

            <div className="product-detail__buy-info">
              <div className="product-detail__buy-row">
                <span className="text-muted">{t('product.delivery')}</span>
                <span>{t('product.instant')}</span>
              </div>
              <div className="product-detail__buy-row">
                <span className="text-muted">{t('product.format')}</span>
                <span>{t('product.digital')}</span>
              </div>
            </div>
          </div>

          {seller && (
            <div className="card product-detail__seller">
              <h3 className="product-detail__section-title">{t('product.seller')}</h3>
              <Link to={`/sellers/${seller.username}`} className="seller-preview">
                <div className="profile-avatar seller-preview__avatar">
                  {seller.avatar_url && (
                    <img src={seller.avatar_url} alt={seller.display_name} className='profile-avatar__img' />
                  ) || (
                    <div className="seller-preview__avatar-placeholder">
                      {seller.display_name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="seller-preview__name">{seller.display_name}</div>
                  <div className="seller-preview__meta text-muted">
                    {stars(seller.rating ?? 0)} · {t('product.sales', { count: seller.total_sales ?? 0 })}
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
