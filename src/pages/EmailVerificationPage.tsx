import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { tokenStorage } from '../store/tokenStorage'
import './EmailVerificationPage.css'

const VERIFY_EMAIL_KEY = 2;

const SENT_KEY = 'sh_verify_email_sent';

export function EmailVerificationPage() {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [success, setSuccess] = useState(false);
  const [changeEmail, setChangeEmail] = useState<boolean>(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState<boolean>(false);
  const [errModalMessage, setErrorModalMessage] = useState<string>("");
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [operationId, setOperationId] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (success || error) {
      const ms = success ? 1500 : 1000;
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(false);
      }, ms);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown > 0]);

  useEffect(() => {
    if (!user?.email) return;
    if (sessionStorage.getItem(SENT_KEY)) return;
    sessionStorage.setItem(SENT_KEY, '1');
    authApi.requestVerifyEmail(user.email).then((res) => {
      setOperationId(res.operation_id);
      setCooldown(60);
    }).catch(() => {});
  }, [user?.email]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resendLoading || !user?.email) return;
    setResendLoading(true);
    setError(false);
    try {
      const res = await authApi.requestVerifyEmail(user.email);
      setOperationId(res.operation_id);
      setDigits(Array(6).fill(''));
      setCooldown(60);
    } catch {
      setError(true);
    } finally {
      setResendLoading(false);
    }
  }, [cooldown, resendLoading, user?.email]);

  const verifyCode = useCallback(async (code: string) => {
    if (!operationId) return;
    setLoading(true);
    try {
      const { reset_token: verifyToken } = await authApi.approveCode(code, operationId, VERIFY_EMAIL_KEY);
      const { success, access_token, refresh_token } = await authApi.verifyEmail(verifyToken);
      if (success) {
        tokenStorage.setTokens(access_token, refresh_token);
      }
      setSuccess(true);
      setError(false);
      setTimeout(() => { window.location.href = '/' }, 2000);
    } catch {
      setError(true);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }, [operationId]);

  const resetEmail = useCallback(async (newEmail: string) => {
    if (!showChangeEmailModal) return;
    setLoading(true);
    try {
      const { operation_id } = await authApi.resetEmail({new_email: newEmail});
      setShowChangeEmailModal(false);
      setOperationId(operation_id);
      setChangeEmail(false);
      setSuccess(true);
      setError(false);
      setUser((currentUser) => currentUser ? { ...currentUser, email: newEmail } : currentUser);
    } catch (err: any) {
      setError(true);
      setSuccess(false);
      const errMessage = err?.response?.data?.message.toLowerCase();
      if (errMessage) {
        switch (true) {
          case errMessage.includes("already exists"):
            setErrorModalMessage(t("emailVerification.changeEmail.modal.alreadyUses"));
            break;
          case errMessage.includes("email already reset"):
            setErrorModalMessage(t("emailVerification.changeEmail.modal.alreadyReset"))
            break;
          case errMessage.includes('invalid resetemailrequest.newemail'):
            setErrorModalMessage(t("emailVerification.changeEmail.modal.invalidEmail"));
            break;
          default:
            setErrorModalMessage(errMessage);
            break;
        }
        return
      }
      setErrorModalMessage(t("emailVerification.changeEmail.modal.failedToResetEmail"))
    } finally {
      setLoading(false);
    }
  }, [showChangeEmailModal])

  const locked = success || error || loading;

  const handleChange = (index: number, value: string) => {
    if (locked || !/^\d?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const code = next.join('');
      verifyCode(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (!locked && index < 6) {
      setSuccess(false);
      setError(false);
    }
    if (e.key === 'Backspace' && !locked && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (locked) return;
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      verifyCode(pasted);
    }
  };

  const handleChangeEmailAddress = (email: string) => {
    if (!showChangeEmailModal) return;
    resetEmail(email);
  }

  return (
    <>
     <div className="email-verify-page">
      {changeEmail ? (
        <div className="email-verify-card">
          <button className="email-verify-btn__back text-muted" onClick={() => setChangeEmail(false)}>← {t("emailVerification.changeEmail.backButton")}</button>
          <h1 className="email-verify-title">{t('emailVerification.changeEmail.title')}</h1>
          <p className="email-verify-subtitle">
            {t('emailVerification.changeEmail.body1')} <strong>{user?.email}</strong> {t('emailVerification.changeEmail.body2')}
            <span> {t('emailVerification.changeEmail.footer')}</span>
          </p>
          <div className="email-verify-selector">
            <button className="btn btn-primary" onClick={() => {
              setChangeEmail(false);
              setShowChangeEmailModal(true);
            }}>{t("emailVerification.changeEmail.yes")}</button>
            <button className="btn btn-secondary" onClick={() => setChangeEmail(false)}>{t("emailVerification.changeEmail.no")}</button>
          </div>
        </div>
      ) : (
        <div className="email-verify-card">
        <h1 className="email-verify-title">{t('emailVerification.title')}</h1>
        <p className="email-verify-subtitle">
          {t('emailVerification.body1')} <strong>{user?.email}</strong> {t('emailVerification.body2')}
          <span> {t('emailVerification.footer')}</span>
        </p> 

        <div className="code-inputs">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              className={`code-input${success ? ' code-input--success' : ''}${error ? ' code-input--error' : ''}`}
              style={success ? { animationDelay: `${i * 0.08}s` } : undefined}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <div className="email-verify-resend">
          <div className="email-verification-footer">
          {cooldown > 0 ? (
            <span className="email-verify-cooldown">
              {t('emailVerification.resendIn')} {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}
            </span>
          ) : (
            <button className="email-verify-btn" onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? t('emailVerification.sending') || 'Sending...' : t('emailVerification.resend')}
            </button>
          )}
          <button className="email-verify-btn" onClick={() => setChangeEmail(true)} disabled={changeEmail || resendLoading}>
                  {t('emailVerification.changeEmail._')}
          </button>
          </div>
        </div>
      </div>
      )}
    </div>

    {showChangeEmailModal && (
      <div className="modal-overlay">
        <div className="modal-content card">
          <div className="modal-header">
            <h2 className="modal-title">{t("emailVerification.changeEmail.modal.title")}</h2>
            <button className="modal-close" onClick={() => setShowChangeEmailModal(false)}>×</button>
          </div>
          {errModalMessage && (
            <div className="modal-review__error-section">
              <span className="error">{errModalMessage}</span>
            </div>
          )}
          <div className="modal-review__change-section">
            <label htmlFor="email" className="form-label">{t("emailVerification.changeEmail.modal.label")}</label>
            <input type="email" className="input" id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t("emailVerification.changeEmail.modal.placeholder")} />
          </div>
          <div className="modal-review__actions">
            <button className="btn btn-success btn-review-action" onClick={() => handleChangeEmailAddress(newEmail)}>{t("emailVerification.changeEmail.yes")}</button>
            <div className="btn btn-secondary" onClick={() => setShowChangeEmailModal(false)}>{t("emailVerification.changeEmail.no")}</div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
