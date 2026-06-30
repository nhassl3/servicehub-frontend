import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'
import { tokenStorage } from '../store/tokenStorage'
import './EmailVerificationPage.css'

const VERIFY_EMAIL_KEY = 2;

export function EmailVerificationPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [operationId, setOperationId] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const initialRequested = useRef(false);

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
    if (!user?.email || initialRequested.current) return;
    initialRequested.current = true;
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

  return (
    <div className="email-verify-page">
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
          {cooldown > 0 ? (
            <span className="email-verify-cooldown">
              {t('emailVerification.resendIn')} {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}
            </span>
          ) : (
            <button className="email-verify-resend-btn" onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? t('emailVerification.sending') || 'Sending…' : t('emailVerification.resend')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
