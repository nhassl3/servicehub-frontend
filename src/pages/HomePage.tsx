import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { categoriesApi } from '../api/categories'
import { productsApi } from '../api/products'
import { HeroGlow } from '../components/HeroGlow'
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
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    categoriesApi.list().then(d => setCategories(d.categories ?? []));
    productsApi.list({ limit: 8, offset: 0 }).then(d => setFeatured(d.products ?? []));
  }, []);

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
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
          <div className="hero__badge">{t('home.badge')}</div>
          <h1 className="hero__title">
            {t('home.titleLine1')}<br />
            <span className="hero__title-accent">{t('home.titleLine2')}</span>
          </h1>
          <p className="hero__subtitle">{t('home.subtitle')}</p>

          <form className="hero__search" onSubmit={handleSearch}>
            <input
              className="hero__search-input"
              type="text"
              placeholder={t('home.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary hero__search-btn">
              {t('home.search')}
            </button>
          </form>

          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-value">6</span>
              <span className="hero__stat-label">{t('home.categories')}</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">∞</span>
              <span className="hero__stat-label">{t('home.products')}</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">24/7</span>
              <span className="hero__stat-label">{t('home.instantDelivery')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="home-section-title">{t('home.browseCategories')}</h2>
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
        <HeroGlow />
      </section>


      {/* ── Featured Products ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="home-section-header">
              <h2 className="home-section-title">{t('home.featuredProducts')}</h2>
              <Link to="/catalog" className="btn btn-secondary btn-sm">{t('home.viewAll')}</Link>
            </div>
            <div className="grid-products">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} slug={categories[p.category_id-1].slug} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="home-cta section">
        <div className="container home-cta__inner">
          <h2>{t('home.ctaTitle')}</h2>
          <p className="text-muted">{t('home.ctaSubtitle')}</p>
          <Link to="/sellers/create" className="btn btn-primary">
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>
    </div>
  );
}
