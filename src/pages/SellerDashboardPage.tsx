import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../api/products'
import { sellersApi } from '../api/sellers'
import { useAuth } from '../context/AuthContext'
import type { Product, Seller } from '../types'
import './SellerDashboardPage.css'

type CreateProductForm = {
  title: string;
  description: string;
  price: string;
  category_id: string;
  tags: string;
};

const EMPTY_FORM: CreateProductForm = {
  title: '',
  description: '',
  price: '',
  category_id: '',
  tags: '',
};

export function SellerDashboardPage() {
  const { user } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateProductForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user) return;
    sellersApi.getProfile(user.username).then(d => setSeller(d.seller)).catch(() => {});
    productsApi.list({ seller_id: user.username, limit: 50, offset: 0 })
      .then(d => setProducts(d.products ?? []))
      .finally(() => setLoadingProducts(false));
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const { product } = await productsApi.create({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category_id: parseInt(form.category_id, 10),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setProducts(prev => [product, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await productsApi.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  if (!user || user.role !== 'seller') {
    return (
      <div className="container section">
        <div className="card orders-empty">
          <p className="text-muted">You need to be a seller to access the dashboard.</p>
          <Link to="/sellers/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Become a Seller
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Seller Dashboard</h1>
          {seller && (
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              {seller.display_name} · {seller.total_sales} sales · {seller.rating.toFixed(1)}★
            </p>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ New Product'}
        </button>
      </div>

      {/* ── Create Form ───────────────────────────────────────────────────── */}
      {showForm && (
        <div className="card dashboard-form">
          <h2 className="dashboard-form__title">Create Product</h2>
          {formError && <div className="auth-error">{formError}</div>}
          <form onSubmit={handleCreate} className="auth-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="input"
                placeholder="My API Service"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input"
                placeholder="Describe your product…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                style={{ resize: 'vertical' }}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="9.99"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category ID</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                className="input"
                placeholder="api, rest, json"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      {/* ── Products table ────────────────────────────────────────────────── */}
      <div className="card dashboard-products">
        <h2 className="dashboard-products__title">My Products ({products.length})</h2>

        {loadingProducts ? (
          <div className="flex-center" style={{ padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted">You have no products yet. Create your first one!</p>
        ) : (
          <div className="dashboard-table">
            <div className="dashboard-table__header">
              <span>Product</span>
              <span>Price</span>
              <span>Status</span>
              <span>Sales</span>
              <span>Rating</span>
              <span>Actions</span>
            </div>
            {products.map(p => (
              <div key={p.id} className="dashboard-table__row">
                <span className="dashboard-table__title">
                  <Link to={`/products/${p.id}`} className="text-primary">{p.title}</Link>
                </span>
                <span>${p.price.toFixed(2)}</span>
                <span>
                  <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {p.status}
                  </span>
                </span>
                <span>{p.sales_count}</span>
                <span>{p.rating.toFixed(1)}★</span>
                <span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
