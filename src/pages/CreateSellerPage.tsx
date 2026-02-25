import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellersApi } from '../api/sellers';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export function CreateSellerPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ display_name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { seller } = await sellersApi.create(form);
      await refreshUser();
      navigate(`/sellers/${seller.username}`);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to create seller profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-title">Become a Seller</h1>
          <p className="text-muted">Set up your seller profile to start selling on ServiceHub</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              className="input"
              type="text"
              placeholder="My Dev Studio"
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input"
              placeholder="Tell buyers what you offer…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Seller Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
