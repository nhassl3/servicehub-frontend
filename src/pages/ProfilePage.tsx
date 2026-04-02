import { useEffect, useRef, useState } from 'react'
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'update'>('info');
   const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm: ''
  });

  if (!user) return null;

  // useEffect to close upload modal on Escape key press
  // working when modal is open and not when it's closing to prevent conflicts
  // with the closing animation
  useEffect(() => {
    if (!showUploadModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUploadModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showUploadModal]);

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
      setError(err?.response?.data?.message ?? t('profile.failedChangePassword'));
    } finally {
      setLoading(false);
    }
  };

  const closeUploadModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setModalClosing(false);
      setAvatarFile(null);
      setUploadError('');
      setUploadSuccess('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 200);
  };

  const handleChangePhoto = async (e: React.SubmitEvent) => {
    e.preventDefault();
        if (!avatarFile) return;
        setUploadError('');
        setUploadSuccess('');
        setUploadingAvatar(true);
        try {
          await userApi.uploadAvatar(avatarFile);
          setUploadSuccess(t('seller.avatarChanged'));
          setAvatarFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
          setUploadError(err?.response?.data?.message.toUpperCase() ?? t('seller.failedUploadAvatar'));
        } finally {
          setUploadingAvatar(false);
          window.location.reload();
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
      <h1 className="page-title">{t('profile.title')} · {user.username.toUpperCase()}</h1>

      <div className="profile-layout">
        {/* ── Left: Avatar & Quick Nav ──────────────────────────────────────── */}
        <aside className="profile-sidebar card">
          <button onClick={() => setShowUploadModal(true)} className="profile-avatar">{user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="profile-avatar__img" />
          ) : (
              <span>{initials}</span>
          )}</button>
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
            <button
                className={`profile-tab${activeTab === 'update' ? ' active' : ''}`}
                onClick={() => setActiveTab('update')}
            >
              {t('profile.update')}
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

          {activeTab === 'update' && (
              <div className="card profile-panel">
                {error && <div className="error">{error}</div>}

                {success && <div className="success">{success}</div>}

                <form className="auth-form" onSubmit={handleChangePhoto}>
                  <div className="form-group">
                    <label className="form-label">{t('profile.changePhoto')}</label>
                    <input
                        id="avatar"
                        name="avatar"
                        accept="image/png, image/jpeg"
                        className="input-file"
                        type="file"
                        required
                        autoFocus
                    />
                  </div>

                  <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                    {loading ? t('profile.changingPhoto') : t('profile.changePhoto')}
                  </button>
                </form>

              </div>
          )}

          {/* ── Upload Avatar Modal ─────────────────────────────────────────── */}
      {showUploadModal && (
        <div className={`modal-overlay${modalClosing ? ' closing' : ''}`} onClick={closeUploadModal}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('seller.uploadAvatarTitle')}</h2>
              <button className="modal-close" onClick={closeUploadModal}>&times;</button>
            </div>
            {uploadError && <div className="auth-error flex-center">{uploadError.toUpperCase()}</div>}
            {uploadSuccess && <div className="success flex-center">{uploadSuccess.toUpperCase()}</div>}
            <form onSubmit={handleChangePhoto} className="auth-form">
              <div className="form-group">
                <label className="form-label">{t('seller.selectAvatar')}</label>
                <input
                  ref={fileInputRef}
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={e => setAvatarFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" type="submit" disabled={uploadingAvatar || !avatarFile}>
                  {uploadingAvatar ? t('seller.uploadingAvatar') : t('seller.uploadAvatar')}
                </button>
                <button className="btn btn-secondary" type="button" onClick={closeUploadModal}>
                  {t('seller.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
