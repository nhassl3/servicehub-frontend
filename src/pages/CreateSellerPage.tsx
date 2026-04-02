import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { sellersApi } from '../api/sellers'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export function CreateSellerPage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ display_name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { seller } = await sellersApi.create(form);
      await refreshUser();
      navigate(`/sellers/${seller.username}`);
    } catch (err: any) {
      setError(String(err?.response?.data?.message).toLocaleUpperCase() ?? 'Failed to create seller profile');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'seller' || user?.role === 'admin') {
    return (
      <div className="flex-center" style={{ minHeight: '55vh' }}>
        <div className="auth-card card">
          <div className="auth-header">
            <h1 className="auth-title">{t('createSeller.forbiddenCreateSeller')}</h1>
            <p className="text-muted">{t('createSeller.forbiddenDesc')}</p>
          </div>
          <div className="auth-error flex-center">
            {t('createSeller.contactSupport')}
          </div>
          <div className="auth-actions">
            <button className="btn btn-primary auth-submit" onClick={() => navigate(user?.role === 'seller' ? '/seller/dashboard' : '/admin/dashboard')}>
              {t('createSeller.goToDashboard')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-title">{t('createSeller.title')}</h1>
          <p className="text-muted">{t('createSeller.subtitle')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('createSeller.displayName')}</label>
            <input
              className="input"
              type="text"
              placeholder={t('createSeller.displayNamePlaceholder')}
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('createSeller.description')}</label>
            <textarea
              className="input"
              placeholder={t('createSeller.descPlaceholder')}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? t('createSeller.creating') : t('createSeller.create')}
          </button>
        </form>
      </div>
    </div>
  );
}
