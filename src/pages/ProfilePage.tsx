import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { userApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

export function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
   const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm: ''
  });

  if (!user) return null;

  const handleChangePassword = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.confirm) {
      setError(t('profile.passwordsNoMatch'));
      return;
    }
    setLoading(true);
    try {
      await userApi.updatePassword(form.old_password, form.new_password);
      setSuccess(t('profile.passwordChanged'))
    } catch (err: any) {
      setError(err?.response?.data?.error ?? t('profile.failedChangePassword'));
    } finally {
      setLoading(false);
    }
  };

  const initials = user.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user.username.slice(0, 2).toUpperCase();

  const roleBadgeClass = {
    buyer: 'badge-primary',
    seller: 'badge-success',
    admin: 'badge-warning',
  }[user.role];

  return (
    <div className="container section">
      <h1 className="page-title">{t('profile.title')}</h1>

      <div className="profile-layout">
        {/* ── Left: Avatar & Quick Nav ──────────────────────────────────────── */}
        <aside className="profile-sidebar card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-sidebar__name">{user.full_name || user.username}</div>
          <div className="profile-sidebar__username text-muted">@{user.username}</div>
          <span className={`badge ${roleBadgeClass} profile-sidebar__role`}>{t(`profile.${user.role}Account`)}</span>

          <nav className="profile-sidebar__nav">
            <Link to="/orders" className="profile-nav-link">{t('profile.myOrders')}</Link>
            <Link to="/wishlist" className="profile-nav-link">{t('profile.wishlist')}</Link>
            <Link to="/balance" className="profile-nav-link">{t('profile.balance')}</Link>
            {user.role === 'seller' && (
              <Link to="/seller/dashboard" className="profile-nav-link text-success">
                {t('profile.sellerDashboard')}
              </Link>
            )}
            {user.role === 'buyer' && (
              <Link to="/sellers/create" className="profile-nav-link text-primary">
                {t('profile.becomeSeller')}
              </Link>
            )}
          </nav>
        </aside>

        {/* ── Right: Tab content ────────────────────────────────────────────── */}
        <div className="profile-main">
          <div className="profile-tabs">
            <button
              className={`profile-tab${activeTab === 'info' ? ' active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              {t('profile.accountInfo')}
            </button>
            <button
              className={`profile-tab${activeTab === 'security' ? ' active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              {t('profile.security')}
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="card profile-panel">
              <div className="profile-field">
                <span className="form-label">{t('profile.username')}</span>
                <span>{user.username}</span>
              </div>
              <div className="profile-field">
                <span className="form-label">{t('profile.fullName')}</span>
                <span>{user.full_name || '—'}</span>
              </div>
              <div className="profile-field">
                <span className="form-label">{t('profile.email')}</span>
                <span>{user.email}</span>
              </div>
              <div className="profile-field">
                <span className="form-label">{t('profile.memberSince')}</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="profile-field">
                <span className="form-label">{t('profile.status')}</span>
                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                  {user.is_active ? t('profile.active') : t('profile.inactive')}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card profile-panel">
              <h1>{t('profile.changePassword')}</h1>

              {error && <div className="error">{error}</div>}

              {success && <div className="success">{success}</div>}

               <form className="auth-form" onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">{t('profile.oldPassword')}</label>
                  <input
                    className="input"
                    type="password"
                    placeholder={t('profile.oldPasswordPlaceholder')}
                    value={form.old_password}
                    onChange={e => setForm(f => ({ ...f, old_password: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('profile.newPassword')}</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    value={form.new_password}
                    onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                    required
                  />
                </div>

                  <div className="form-group">
                  <label className="form-label">{t('profile.confirmNewPassword')}</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                  />
                </div>

                <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                  {loading ? t('profile.changingPassword') : t('profile.changePassword')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
