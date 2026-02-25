import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoriesApi } from '../api/categories'
import { productsApi } from '../api/products'
import { ProductCard } from '../components/product/ProductCard'
import type { Category, Product } from '../types'
import './HomePage.css'

const CATEGORY_ICONS: Record<string, string> = {
  'api-services': '⚡',
  'osint':        '🔍',
  'parsers':      '🕸️',
  'software':     '💻',
  'general':      '🛠️',
  'scripts':      '📜',
};

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    categoriesApi.list().then(d => setCategories(d.categories ?? []));
    productsApi.list({ limit: 8, offset: 0 }).then(d => setFeatured(d.products ?? []));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__badge">Digital Marketplace</div>
          <h1 className="hero__title">
            The hub for digital<br />
            <span className="hero__title-accent">services & tools</span>
          </h1>
          <p className="hero__subtitle">
            APIs, OSINT tools, parsers, scripts, and software — all in one place.
            Buy, sell, and build faster.
          </p>

          <form className="hero__search" onSubmit={handleSearch}>
            <input
              className="hero__search-input"
              type="text"
              placeholder="Search APIs, tools, scripts…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary hero__search-btn">
              Search
            </button>
          </form>

          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-value">6</span>
              <span className="hero__stat-label">Categories</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">∞</span>
              <span className="hero__stat-label">Products</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">24/7</span>
              <span className="hero__stat-label">Instant Delivery</span>
            </div>
          </div>
        </div>

        <div className="hero__glow" />
      </section>

      {/* ── Categories ────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="home-section-title">Browse Categories</h2>
          <div className="category-grid">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/catalog?category=${cat.slug}`}
                className="category-card"
              >
                <span className="category-card__icon">
                  {CATEGORY_ICONS[cat.slug] ?? '📦'}
                </span>
                <span className="category-card__name">{cat.name}</span>
                <span className="category-card__desc text-muted">
                  {cat.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="home-section-header">
              <h2 className="home-section-title">Featured Products</h2>
              <Link to="/catalog" className="btn btn-secondary btn-sm">View All →</Link>
            </div>
            <div className="grid-products">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="home-cta section">
        <div className="container home-cta__inner">
          <h2>Ready to sell your service?</h2>
          <p className="text-muted">
            Join thousands of developers monetizing their tools and APIs.
          </p>
          <Link to="/sellers/create" className="btn btn-primary">
            Become a Seller
          </Link>
        </div>
      </section>
    </div>
  );
}
