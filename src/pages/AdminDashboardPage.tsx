import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { adminsApi } from '../api/admins'
import { moderationApi } from '../api/moderation'
import { useAuth } from '../context/AuthContext'
import type { Admin } from '../types'
import { type ModerationStats, type QueueProduct } from '../types'
import './AdminDashboardPage.css'

type Tab = 'queue' | 'my' | 'stats';

const PAGE_SIZE = 12;

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [tab, setTab] = useState<Tab>('queue');

  // Queue state
  const [queueProducts, setQueueProducts] = useState<QueueProduct[]>([]);
  const [queueTotal, setQueueTotal] = useState(0);
  const [queuePage, setQueuePage] = useState(0);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // My reviews state
  const [myProducts, setMyProducts] = useState<QueueProduct[]>([]);
  const [myTotal, setMyTotal] = useState(0);
  const [myPage, setMyPage] = useState(0);
  const [loadingMy, setLoadingMy] = useState(false);

  // Stats
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Action states
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  // Review modal
  const [reviewProduct, setReviewProduct] = useState<QueueProduct | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [modalClosing, setModalClosing] = useState(false);

  // Upload avatar modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create admin modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ display_name: '', level_rights: 1 });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // ── Load admin profile ──────────────────────────────────────────────
  useEffect(() => {
    if (!user?.username) return;
    let cancelled = false;
    adminsApi.getProfileByUsername(user.username)
      .then(d => { if (!cancelled) setAdmin(d.admin); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.username]);

  // ── Load queue ──────────────────────────────────────────────────────
  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const data = await moderationApi.queue(PAGE_SIZE, queuePage * PAGE_SIZE);
      setQueueProducts(data.products ?? []);
      setQueueTotal(data.total);
    } catch {
      setQueueProducts([]);
    } finally {
      setLoadingQueue(false);
    }
  }, [queuePage]);

  // ── Load my reviews ─────────────────────────────────────────────────
  const loadMy = useCallback(async () => {
    setLoadingMy(true);
    try {
      const data = await moderationApi.my(PAGE_SIZE, myPage * PAGE_SIZE);
      setMyProducts(data.products ?? []);
      setMyTotal(data.total);
    } catch {
      setMyProducts([]);
    } finally {
      setLoadingMy(false);
    }
  }, [myPage]);

  // ── Load stats ──────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await moderationApi.stats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'queue') loadQueue();
    if (tab === 'my') loadMy();
    if (tab === 'stats') loadStats();
  }, [tab, loadQueue, loadMy, loadStats]);

  // ── Actions ─────────────────────────────────────────────────────────
  const handleClaim = async (productId: string) => {
    if (productId === "") return;
    setClaimingId(productId);
    setActionError('');
    try {
      await moderationApi.claim(productId);
      await loadQueue();
      await loadMy();
      setTab('my');
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? t('admin.claimFailed'));
    } finally {
      setClaimingId(null);
    }
  };

  const handleRelease = async (productId: string) => {
    if (productId === "") return;
    setActionId(productId);
    setActionError('');
    try {
      await moderationApi.release(productId);
      await loadMy();
      await loadQueue();
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? t('admin.releaseFailed'));
    } finally {
      setActionId(null);
    }
  };

  const handleApprove = async (productId: string) => {
    setActionId(productId);
    setActionError('');
    try {
      await moderationApi.approve(productId);
      closeReviewModal();
      await loadMy();
      await loadQueue();
      if (admin) {
        setAdmin({ ...admin, total_moderation: admin.total_moderation + 1 });
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? t('admin.approveFailed'));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (productId: string) => {
    if (!rejectReason.trim()) {
      setActionError(t('admin.rejectReasonRequired'));
      return;
    }
    setActionId(productId);
    setActionError('');
    try {
      await moderationApi.reject(productId, rejectReason);
      closeReviewModal();
      await loadMy();
      await loadQueue();
      if (admin) {
        setAdmin({ ...admin, total_moderation: admin.total_moderation + 1 });
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? t('admin.rejectFailed'));
    } finally {
      setActionId(null);
    }
  };

  // ── Upload avatar ───────────────────────────────────────────────────
  const handleUploadAvatar = async (e: React.FormEvent) => {
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
    }
  };

  // ── Create admin ────────────────────────────────────────────────────
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreatingAdmin(true);
    try {
      const { admin: newAdmin } = await adminsApi.createAdmin(
        createForm.display_name,
        createForm.level_rights
      );
      setCreateSuccess(t('admin.adminCreated', { name: newAdmin.display_name }));
      setCreateForm({ display_name: '', level_rights: 1 });
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? t('admin.createFailed'));
    } finally {
      setCreatingAdmin(false);
    }
  };

  // ── Modal helpers ───────────────────────────────────────────────────
  const closeModal = (callback: () => void) => {
    setModalClosing(true);
    setTimeout(() => {
      callback();
      setModalClosing(false);
      setActionError('');
    }, 200);
  };

  const closeReviewModal = () => {
    closeModal(() => {
      setReviewProduct(null);
      setRejectReason('');
    });
  };

  const closeUploadModal = () => {
    closeModal(() => {
      setShowUploadModal(false);
      setAvatarFile(null);
      setUploadError('');
      setUploadSuccess('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const closeCreateModal = () => {
    closeModal(() => {
      setShowCreateModal(false);
      setCreateForm({ display_name: '', level_rights: 1 });
      setCreateError('');
      setCreateSuccess('');
    });
  };

  // Escape key for modals
  useEffect(() => {
    if (!reviewProduct && !showUploadModal && !showCreateModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (reviewProduct) closeReviewModal();
        if (showUploadModal) closeUploadModal();
        if (showCreateModal) closeCreateModal();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [reviewProduct, showUploadModal, showCreateModal]);

  // ── Guards ──────────────────────────────────────────────────────────
  if (!user || user.role !== 'admin') {
    return (
      <div className="container section">
        <div className="card admin-empty">
          <div className="admin-empty__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2>{t('admin.accessDenied')}</h2>
          <p className="text-muted">{t('admin.needadmin')}</p>
        </div>
      </div>
    );
  }

  const queueTotalPages = Math.ceil(queueTotal / PAGE_SIZE);
  const myTotalPages = Math.ceil(myTotal / PAGE_SIZE);

  return (
    <div className="container section admin-dashboard">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="admin-header">
        <div className="admin-header__info">
          <button className="admin-header__avatar" onClick={() => setShowUploadModal(true)}>
            {admin?.avatar_url ? (
              <img src={admin.avatar_url} alt="" className="admin-header__avatar-img" />
            ) : (
              <span>{admin?.display_name?.[0]?.toUpperCase() ?? 'A'}</span>
            )}
            <span className="admin-header__status-dot" />
          </button>
          <div>
            <h1 className="admin-header__title">{t('admin.dashboard')}</h1>
            {admin && (
              <p className="admin-header__meta">
                {admin.display_name}
                <span className="admin-header__separator">&middot;</span>
                <span className="badge badge-primary">{t('admin.level')} {admin.level_rights ?? 1}</span>
                <span className="admin-header__separator">&middot;</span>
                {admin.total_moderation ?? 0} {t('admin.moderations')}
              </p>
            )}
          </div>
        </div>
        <div className="admin-header__actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowUploadModal(true)}>
            {t('admin.changeAvatar')}
          </button>
          {admin?.level_rights === 3 && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              {t('admin.createAdmin')}
            </button>
          )}
        </div>
      </div>

      {/* ── Quick Stats Bar ───────────────────────────────────────────── */}
      {stats && (
        <div className="admin-stats-bar">
          <div className="admin-stat-chip">
            <span className="admin-stat-chip__value text-warning">{stats.total_pending ?? 0}</span>
            <span className="admin-stat-chip__label">{t('admin.pending')}</span>
          </div>
          <div className="admin-stat-chip">
            <span className="admin-stat-chip__value text-primary">{stats.total_claimed ?? 0}</span>
            <span className="admin-stat-chip__label">{t('admin.inReview')}</span>
          </div>
          <div className="admin-stat-chip">
            <span className="admin-stat-chip__value text-success">{stats.total_approved ?? 0}</span>
            <span className="admin-stat-chip__label">{t('admin.approved')}</span>
          </div>
          <div className="admin-stat-chip">
            <span className="admin-stat-chip__value text-error">{stats.total_rejected ?? 0}</span>
            <span className="admin-stat-chip__label">{t('admin.rejected')}</span>
          </div>
        </div>
      )}

      {/* ── Tab Nav ───────────────────────────────────────────────────── */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'queue' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('queue')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          {t('admin.queue')}
          {queueTotal > 0 && <span className="admin-tab__badge">{queueTotal}</span>}
        </button>
        <button
          className={`admin-tab${tab === 'my' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('my')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          {t('admin.myReviews')}
          {myTotal > 0 && <span className="admin-tab__badge">{myTotal}</span>}
        </button>
        <button
          className={`admin-tab${tab === 'stats' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('stats')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          {t('admin.statistics')}
        </button>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────── */}
      {actionError && (
        <div className="admin-error">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')}>&times;</button>
        </div>
      )}

      {/* ── Queue Tab ─────────────────────────────────────────────────── */}
      {tab === 'queue' && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2>{t('admin.moderationQueue')}</h2>
            <button className="btn btn-secondary btn-sm" onClick={loadQueue} disabled={loadingQueue}>
              {t('admin.refresh')}
            </button>
          </div>

          {loadingQueue ? (
            <div className="flex-center" style={{ padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : queueProducts.length === 0 ? (
            <div className="admin-empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p>{t('admin.queueEmpty')}</p>
            </div>
          ) : (
            <>
              <div className="admin-queue">
                {queueProducts.map(p => {
                  const isClaimed = !!p.moderation?.active;
                  const isClaimedByMe = p.moderation?.admin_id === admin?.id;
                  const isClaimedByOther = isClaimed && !isClaimedByMe;

                  return (
                    <div
                      key={p.product?.id ?? 'unknown'}
                      className={`admin-queue-card card${isClaimedByOther ? ' admin-queue-card--locked' : ''}${isClaimedByMe ? ' admin-queue-card--mine' : ''}`}
                    >
                      {isClaimedByOther && (
                        <div className="admin-queue-card__lock-banner">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                          {t('admin.lockedBy', { name: p.moderation?.admin_username ?? '...' })}
                        </div>
                      )}

                      <div className="admin-queue-card__body">
                        <div className="admin-queue-card__info">
                          <h3 className="admin-queue-card__title">
                            <Link to={`/products/${p.product?.id}`} className="text-primary">{p.product?.title}</Link>
                          </h3>
                          <p className="admin-queue-card__desc">{p.product?.description}</p>
                          <div className="admin-queue-card__meta">
                            <span className="badge badge-warning">${p.product?.price?.toFixed(2) ?? '0.00'}</span>
                            {p.product?.tags && p.product.tags.length > 0 && p.product.tags.map(tag => (
                              <span key={tag} className="admin-queue-card__tag">{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className="admin-queue-card__actions">
                          {!isClaimed && (
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={claimingId === p.product?.id}
                              onClick={() => handleClaim(p.product?.id ?? "")}
                            >
                              {claimingId === p.product?.id ? t('admin.claiming') : t('admin.claim')}
                            </button>
                          )}
                          {isClaimedByMe && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => { setReviewProduct(p); setActionError(''); }}
                              >
                                {t('admin.review')}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled={actionId === p.product?.id}
                                onClick={() => handleRelease(p.product?.id ?? "")}
                              >
                                {t('admin.release')}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {queueTotalPages > 1 && (
                <div className="admin-pagination">
                  <button className="btn btn-secondary btn-sm" disabled={queuePage === 0} onClick={() => setQueuePage(p => p - 1)}>
                    {t('catalog.prev')}
                  </button>
                  <span className="text-muted">{queuePage + 1} / {queueTotalPages}</span>
                  <button className="btn btn-secondary btn-sm" disabled={queuePage >= queueTotalPages - 1} onClick={() => setQueuePage(p => p + 1)}>
                    {t('catalog.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── My Reviews Tab ────────────────────────────────────────────── */}
      {tab === 'my' && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2>{t('admin.myReviews')}</h2>
            <button className="btn btn-secondary btn-sm" onClick={loadMy} disabled={loadingMy}>
              {t('admin.refresh')}
            </button>
          </div>

          {loadingMy ? (
            <div className="flex-center" style={{ padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : myProducts.length === 0 ? (
            <div className="admin-empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
              <p>{t('admin.noClaimedProducts')}</p>
              <button className="btn btn-primary btn-sm" onClick={() => setTab('queue')}>
                {t('admin.goToQueue')}
              </button>
            </div>
          ) : (
            <>
              <div className="admin-my-reviews">
                {myProducts.map(p => (
                  <div key={p.product?.id} className="admin-review-card card">
                    <div className="admin-review-card__body">
                      <div className="admin-review-card__info">
                        <h3>
                          <Link to={`/products/${p.product?.id}`} className="text-primary">{p.product?.title}</Link>
                        </h3>
                        <p className="admin-review-card__desc">{p.product?.description}</p>
                        <div className="admin-review-card__meta">
                          <span className="badge badge-warning">${p.product?.price?.toFixed(2) ?? '0.00'}</span>
                          <span className="text-muted">
                            {t('admin.claimedAt', { date: new Date(p.moderation?.created_at ?? '').toLocaleDateString() })}
                          </span>
                        </div>
                      </div>
                      <div className="admin-review-card__actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => { setReviewProduct(p); setActionError(''); }}
                        >
                          {t('admin.review')}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={actionId === p.product?.id}
                          onClick={() => handleRelease(p.product?.id ?? "")}
                        >
                          {t('admin.release')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {myTotalPages > 1 && (
                <div className="admin-pagination">
                  <button className="btn btn-secondary btn-sm" disabled={myPage === 0} onClick={() => setMyPage(p => p - 1)}>
                    {t('catalog.prev')}
                  </button>
                  <span className="text-muted">{myPage + 1} / {myTotalPages}</span>
                  <button className="btn btn-secondary btn-sm" disabled={myPage >= myTotalPages - 1} onClick={() => setMyPage(p => p + 1)}>
                    {t('catalog.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Stats Tab ─────────────────────────────────────────────────── */}
      {tab === 'stats' && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2>{t('admin.statistics')}</h2>
            <button className="btn btn-secondary btn-sm" onClick={loadStats} disabled={loadingStats}>
              {t('admin.refresh')}
            </button>
          </div>

          {loadingStats ? (
            <div className="flex-center" style={{ padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : !stats ? (
            <div className="admin-empty-state">
              <p className="text-muted">{t('admin.noStats')}</p>
            </div>
          ) : (
            <div className="admin-stats-grid">
              <div className="admin-stat-card card">
                <div className="admin-stat-card__icon admin-stat-card__icon--pending">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div className="admin-stat-card__value">{stats.total_pending ?? 0}</div>
                <div className="admin-stat-card__label">{t('admin.pendingProducts')}</div>
              </div>

              <div className="admin-stat-card card">
                <div className="admin-stat-card__icon admin-stat-card__icon--review">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </div>
                <div className="admin-stat-card__value">{stats.total_claimed ?? 0}</div>
                <div className="admin-stat-card__label">{t('admin.inReview')}</div>
              </div>

              <div className="admin-stat-card card">
                <div className="admin-stat-card__icon admin-stat-card__icon--approved">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="admin-stat-card__value">{stats.total_approved ?? 0}</div>
                <div className="admin-stat-card__label">{t('admin.approvedProducts')}</div>
              </div>

              <div className="admin-stat-card card">
                <div className="admin-stat-card__icon admin-stat-card__icon--rejected">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="admin-stat-card__value">{stats.total_rejected ?? 0}</div>
                <div className="admin-stat-card__label">{t('admin.rejectedProducts')}</div>
              </div>

              <div className="admin-stat-card card admin-stat-card--wide">
                <div className="admin-stat-card__icon admin-stat-card__icon--total">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div className="admin-stat-card__value">{admin?.total_moderation ?? 0}</div>
                <div className="admin-stat-card__label">{t('admin.yourTotalModerations')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Review Modal ──────────────────────────────────────────────── */}
      {reviewProduct && (
        <div className={`modal-overlay${modalClosing ? ' closing' : ''}`} onClick={closeReviewModal}>
          <div className="modal-content admin-review-modal card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('admin.reviewProduct')}</h2>
              <button className="modal-close" onClick={closeReviewModal}>&times;</button>
            </div>

            <div className="admin-review-modal__product">
              <h3>{reviewProduct.product?.title}</h3>
              <p className="text-muted">{reviewProduct.product?.description}</p>

              <div className="admin-review-modal__details">
                <div className="admin-review-modal__detail">
                  <span className="admin-review-modal__label">{t('seller.tablePrice')}</span>
                  <span className="admin-review-modal__value">${reviewProduct.product?.price?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="admin-review-modal__detail">
                  <span className="admin-review-modal__label">{t('seller.tableStatus')}</span>
                  <span className="badge badge-warning">{reviewProduct.product?.status}</span>
                </div>
                {reviewProduct.product?.tags && reviewProduct.product?.tags.length > 0 && (
                  <div className="admin-review-modal__detail">
                    <span className="admin-review-modal__label">{t('seller.tags')}</span>
                    <div className="admin-review-modal__tags">
                      {reviewProduct.product?.tags.map(tag => (
                        <span key={tag} className="admin-queue-card__tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-review-modal__reject-section">
              <label className="form-label">{t('admin.rejectReasonLabel')}</label>
              <textarea
                className="input"
                rows={3}
                placeholder={t('admin.rejectReasonPlaceholder')}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            </div>

            {actionError && <div className="admin-error" style={{ marginBottom: '1rem' }}>{actionError}</div>}

            <div className="admin-review-modal__actions">
              <button
                className="btn btn-success btn-review-action"
                disabled={actionId === reviewProduct.product?.id}
                onClick={() => handleApprove(reviewProduct.product?.id ?? "")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                {t('admin.approve')}
              </button>
              <button
                className="btn btn-danger btn-review-action"
                disabled={actionId === reviewProduct.product?.id}
                onClick={() => handleReject(reviewProduct.product?.id ?? "")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
                {t('admin.reject')}
              </button>
              <button className="btn btn-secondary" onClick={closeReviewModal}>
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Avatar Modal ───────────────────────────────────────── */}
      {showUploadModal && (
        <div className={`modal-overlay${modalClosing ? ' closing' : ''}`} onClick={closeUploadModal}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('admin.uploadAvatarTitle')}</h2>
              <button className="modal-close" onClick={closeUploadModal}>&times;</button>
            </div>
            {uploadError && <div className="admin-error">{uploadError}</div>}
            {uploadSuccess && <div className="admin-success">{uploadSuccess}</div>}
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
              <div className="modal-actions">
                <button className="btn btn-primary" type="submit" disabled={uploadingAvatar || !avatarFile}>
                  {uploadingAvatar ? t('admin.uploadingAvatar') : t('admin.uploadAvatar')}
                </button>
                <button className="btn btn-secondary" type="button" onClick={closeUploadModal}>
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Admin Modal ────────────────────────────────────────── */}
      {showCreateModal && (
        <div className={`modal-overlay${modalClosing ? ' closing' : ''}`} onClick={closeCreateModal}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('admin.createAdmin')}</h2>
              <button className="modal-close" onClick={closeCreateModal}>&times;</button>
            </div>
            {createError && <div className="admin-error">{createError}</div>}
            {createSuccess && <div className="admin-success">{createSuccess}</div>}
            <form onSubmit={handleCreateAdmin} className="auth-form">
              <div className="form-group">
                <label className="form-label">{t('admin.displayName')}</label>
                <input
                  className="input"
                  type="text"
                  placeholder={t('admin.displayNamePlaceholder')}
                  value={createForm.display_name}
                  onChange={e => setCreateForm(f => ({ ...f, display_name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.levelRights')}</label>
                <select
                  className="input"
                  value={createForm.level_rights}
                  onChange={e => setCreateForm(f => ({ ...f, level_rights: parseInt(e.target.value, 10) }))}
                >
                  <option value={1}>{t('admin.level')} 1 — {t('admin.levelBasic')}</option>
                  <option value={2}>{t('admin.level')} 2 — {t('admin.levelExtended')}</option>
                  <option value={3}>{t('admin.level')} 3 — {t('admin.levelSuper')}</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" type="submit" disabled={creatingAdmin}>
                  {creatingAdmin ? t('admin.creating') : t('admin.createAdmin')}
                </button>
                <button className="btn btn-secondary" type="button" onClick={closeCreateModal}>
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
