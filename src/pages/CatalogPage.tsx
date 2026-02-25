import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { ProductCard } from '../components/product/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import type { Category, Product } from '../types';
import './CatalogPage.css';

const PAGE_SIZE = 12;

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') ?? '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(0);

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    categoriesApi.list().then(d => setCategories(d.categories ?? []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const selectedCategory = categories.find(c => c.slug === categorySlug);
      const params = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        ...(selectedCategory ? { category_id: selectedCategory.id } : {}),
        ...(minPrice ? { min_price: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { max_price: parseFloat(maxPrice) } : {}),
      };

      if (debouncedQuery.trim()) {
        const d = await productsApi.search(debouncedQuery.trim(), PAGE_SIZE, page * PAGE_SIZE);
        setProducts(d.products ?? []);
        setTotal(d.total);
      } else {
        const d = await productsApi.list(params);
        setProducts(d.products ?? []);
        setTotal(d.total);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, categorySlug, minPrice, maxPrice, page, categories]);

  useEffect(() => {
    if (categories.length > 0 || !categorySlug) {
      load();
    }
  }, [load, categories.length, categorySlug]);

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    setPage(0);
    const params: Record<string, string> = {};
    if (slug) params.category = slug;
    if (debouncedQuery) params.q = debouncedQuery;
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="catalog container section">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="catalog__sidebar">
        <div className="card catalog__filter">
          <h3 className="catalog__filter-title">Categories</h3>
          <button
            className={`catalog__cat-btn${!categorySlug ? ' active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              className={`catalog__cat-btn${categorySlug === cat.slug ? ' active' : ''}`}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="card catalog__filter" style={{ marginTop: '1rem' }}>
          <h3 className="catalog__filter-title">Price Range</h3>
          <div className="catalog__price-row">
            <input
              className="input catalog__price-input"
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={e => { setMinPrice(e.target.value); setPage(0); }}
              min="0"
            />
            <span className="text-muted">—</span>
            <input
              className="input catalog__price-input"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => { setMaxPrice(e.target.value); setPage(0); }}
              min="0"
            />
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="catalog__main">
        <div className="catalog__top">
          <input
            className="input catalog__search"
            type="text"
            placeholder="Search products…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
          />
          <span className="text-muted catalog__count">
            {total} result{total !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '300px' }}>
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div className="catalog__empty">
            <p className="text-muted">No products found.</p>
          </div>
        ) : (
          <div className="grid-products">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="catalog__pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              ← Prev
            </button>
            <span className="text-muted">
              {page + 1} / {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
