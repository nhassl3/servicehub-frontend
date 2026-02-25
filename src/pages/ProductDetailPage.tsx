import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../api/products';
import { reviewsApi } from '../api/reviews';
import { sellersApi } from '../api/sellers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Product, Review, Seller } from '../types';
import './ProductDetailPage.css';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    productsApi.get(id).then(({ product }) => {
      setProduct(product);
      // Fetch seller
      sellersApi.getProfile(product.seller_id).catch(() => null).then(d => {
        if (d) setSeller(d.seller);
      });
    });

    reviewsApi.list(id, { limit: 20 }).then(d => {
      setReviews(d.reviews ?? []);
      setReviewTotal(d.total);
    }).finally(() => setLoading(false));
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      const { review } = await reviewsApi.create(id, reviewForm);
      setReviews(prev => [review, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
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
        <p className="text-muted">Product not found.</p>
        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Catalog</Link>
      </div>
    );
  }

  const stars = (rating: number) =>
    '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <div className="container section">
      <Link to="/catalog" className="product-detail__back text-muted">← Back to Catalog</Link>

      <div className="product-detail__layout">
        {/* ── Main Info ────────────────────────────────────────────────────── */}
        <div>
          <div className="card product-detail__main">
            <div className="product-detail__tags">
              {product.tags.map(tag => (
                <span key={tag} className="badge badge-primary">{tag}</span>
              ))}
            </div>

            <h1 className="product-detail__title">{product.title}</h1>

            <div className="product-detail__meta">
              <div className="product-detail__rating">
                <span className="product-detail__stars">{stars(product.rating)}</span>
                <span className="text-muted">({product.reviews_count} reviews)</span>
              </div>
              <span className="badge badge-success">{product.sales_count} sold</span>
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
              Reviews ({reviewTotal})
            </h2>

            {isAuthenticated && (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <h3 className="review-form__title">Write a Review</h3>
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
                  placeholder="Share your experience…"
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={3}
                />
                <button className="btn btn-primary" type="submit" disabled={submittingReview}>
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}

            <div className="review-list">
              {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first!</p>
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
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding…' : 'Add to Cart'}
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Login to Buy
              </Link>
            )}

            <div className="product-detail__buy-info">
              <div className="product-detail__buy-row">
                <span className="text-muted">Delivery</span>
                <span>Instant</span>
              </div>
              <div className="product-detail__buy-row">
                <span className="text-muted">Format</span>
                <span>Digital</span>
              </div>
            </div>
          </div>

          {seller && (
            <div className="card product-detail__seller">
              <h3 className="product-detail__section-title">Seller</h3>
              <Link to={`/sellers/${seller.username}`} className="seller-preview">
                <div className="seller-preview__avatar">
                  {seller.display_name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="seller-preview__name">{seller.display_name}</div>
                  <div className="seller-preview__meta text-muted">
                    {stars(seller.rating)} · {seller.total_sales} sales
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
