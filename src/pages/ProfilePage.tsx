import { useState } from 'react'
import { Link } from 'react-router-dom'
import { userApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

export function ProfilePage() {
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
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await userApi.updatePassword(form.old_password, form.new_password);
      setSuccess('Password changed successfully')
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to change password');
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
      <h1 className="page-title">My Profile</h1>

      <div className="profile-layout">
        {/* ── Left: Avatar & Quick Nav ──────────────────────────────────────── */}
        <aside className="profile-sidebar card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-sidebar__name">{user.full_name || user.username}</div>
          <div className="profile-sidebar__username text-muted">@{user.username}</div>
          <span className={`badge ${roleBadgeClass} profile-sidebar__role`}>{user.role}</span>

          <nav className="profile-sidebar__nav">
            <Link to="/orders" className="profile-nav-link">My Orders</Link>
            <Link to="/wishlist" className="profile-nav-link">Wishlist</Link>
            <Link to="/balance" className="profile-nav-link">Balance</Link>
            {user.role === 'seller' && (
              <Link to="/seller/dashboard" className="profile-nav-link text-success">
                Seller Dashboard
              </Link>
            )}
            {user.role === 'buyer' && (
              <Link to="/sellers/create" className="profile-nav-link text-primary">
                Become a Seller
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
              Account Info
            </button>
            <button
              className={`profile-tab${activeTab === 'security' ? ' active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="card profile-panel">
              <div className="profile-field">
                <span className="form-label">Username</span>
                <span>{user.username}</span>
              </div>
              <div className="profile-field">
                <span className="form-label">Full Name</span>
                <span>{user.full_name || '—'}</span>
              </div>
              <div className="profile-field">
                <span className="form-label">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="profile-field">
                <span className="form-label">Member since</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="profile-field">
                <span className="form-label">Status</span>
                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card profile-panel">
              <h1>ChangePassword</h1>

              {error && <div className="error">{error}</div>}

              {success && <div className="success">Password changed successfully</div>}

               <form className="auth-form" onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Old password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="your old password"
                    value={form.old_password}
                    onChange={e => setForm(f => ({ ...f, old_password: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
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
                  <label className="form-label">Confirm new password</label>
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
                  {loading ? 'Changing password…' : 'Change password'}
                </button>
              </form>          
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
