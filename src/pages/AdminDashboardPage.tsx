import { useEffect, useRef, useState, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { adminsApi } from '../api/admins'
import { useAuth } from '../context/AuthContext'
import type { Admin } from '../types'
import './AdminDashboardPage.css'

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.username) return;
    let cancelled = false;
    adminsApi.getProfileByUsername(user.username)
      .then((d: { admin: SetStateAction<Admin | null> }) => { if (!cancelled) setAdmin(d.admin); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.username]);

  const handleUploadAvatar = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!avatarFile) return;
    setUploadError('');
    setUploadSuccess('');
    setUploadingAvatar(true);
    try {
      const { admin: updated } = await adminsApi.uploadAvatar(avatarFile);
      setAdmin(updated);
      setUploadSuccess(t('admin.avatarChanged'));
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err?.response?.data?.error ?? t('admin.failedUploadAvatar'));
    } finally {
      setUploadingAvatar(false);
      window.location.reload();
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="container section">
        <div className="card orders-empty">
          <p className="text-muted">{t('admin.needadmin')}</p>
          <Link to="/admins/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('admin.becomeadmin')}
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
          <h1 className="page-title" style={{ marginBottom: 0 }}>{t('admin.dashboard')}</h1>
          {admin && (
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              {admin.display_name} · {admin.total_moderation || 0}
            </p>
          )}
        </div>
        <div className="dashboard-header__options">
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? t('admin.cancel') : t('admin.newProduct')}
          </button>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            {t('admin.newUpload')}
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = `/admins/${admin?.username}`}>
            {t('admin.gotoProfile')}
          </button>
        </div>
      </div>

      {/* ── Upload Avatar Modal ─────────────────────────────────────────── */}
      {showUploadModal && (
        <div className={`modal-overlay${modalClosing ? ' closing' : ''}`} onClick={closeUploadModal}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('admin.uploadAvatarTitle')}</h2>
              <button className="modal-close" onClick={closeUploadModal}>&times;</button>
            </div>
            {uploadError && <div className="auth-error flex-center">{uploadError.toUpperCase()}</div>}
            {uploadSuccess && <div className="success flex-center">{uploadSuccess.toUpperCase()}</div>}
            <form onSubmit={handleUploadAvatar} className="auth-form">
              <div className="form-group">
                <label className="form-label">{t('admin.selectAvatar')}</label>
                <input
                  ref={fileInputRef}
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={e => setAvatarFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <div className="modal-actions flex-center">
                <button className="btn btn-primary" type="submit" disabled={uploadingAvatar || !avatarFile}>
                  {uploadingAvatar ? t('admin.uploadingAvatar') : t('admin.uploadAvatar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
