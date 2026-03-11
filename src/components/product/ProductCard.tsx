import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types'
import './ProductCard.css'

interface Props {
  product: Product;
}

export function ProductCard({ product, slug }: Props & { slug?: string }) {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    await addItem(product.id);
  };

  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating || 0));

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__body">
        <div className="product-card__category-id">{slug}</div>
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__description">
          {product.description.slice(0, 120)}{product.description.length > 120 ? '…' : ''}
        </p>

        {product.tags.length > 0 && (
          <div className="product-card__tags">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge badge-primary">{tag}</span>
            ))}
          </div>
        )}

        <div className="product-card__rating">
          <span className="product-card__stars">{stars}</span>
          <span className="product-card__rating-count text-muted">({product.reviews_count || 0})</span>
        </div>
      </div>

      <div className="product-card__footer">
        <span className="product-card__price">${product.price.toFixed(2)}</span>
        {isAuthenticated && (
          <button onClick={handleAddToCart} className="btn btn-primary btn-sm">
            {t('product.addToCart')}
          </button>
        )}
      </div>
    </Link>
  );
}
