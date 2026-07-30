import { AxiosError } from 'axios'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import './AuthPage.css'

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

type Step = 'email' | 'code';

export function RequestResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [touched, setTouched] = useState({ email: false, code: false });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [operationId, setOperationId] = useState('');
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const validateEmail = (value: string): string => {
    if (!value) return t('validation.required');
    return !PATTERNS.email.test(value) ? t('validation.email') : '';
  };

  const validateCode = (value: string): string => {
    if (!value) return t('validation.required');
    return !/^\d{6}$/.test(value) ? t('validation.code') || 'Code must be 6 digits' : '';
  };

  const emailError = validateEmail(email);
  const codeError = validateCode(code);
  const codeDigits = [...code.padEnd(6, ' ').slice(0, 6)];

  const focusCodeInput = (index: number) => {
    codeInputsRef.current[index]?.focus();
    codeInputsRef.current[index]?.select();
  };

  const handleCodeChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(0, 1);
    const nextDigits = codeDigits.slice();
    nextDigits[index] = digit;
    setCode(nextDigits.join('').replace(/ /g, ''));
    if (digit && index < 5) {
      focusCodeInput(index + 1);
    }
  };

  const handleCodeKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const nextDigits = codeDigits.slice();
      if (nextDigits[index]) {
        nextDigits[index] = '';
        setCode(nextDigits.join('').replace(/ /g, ''));
      } else if (index > 0) {
        nextDigits[index - 1] = '';
        setCode(nextDigits.join('').replace(/ /g, ''));
        focusCodeInput(index - 1);
      }
      return;
    }

    if ((e.key === 'ArrowLeft' || e.key === "Backspace") && index > 0) {
      e.preventDefault();
      focusCodeInput(index - 1);
    }

    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      focusCodeInput(index + 1);
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const nextDigits = Array.from({ length: 6 }, (_, idx) => pasted[idx] ?? codeDigits[idx] ?? '');
    setCode(nextDigits.join('').replace(/ /g, ''));
    focusCodeInput(Math.min(pasted.length, 5));
  };

  const handleSubmitEmail = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ ...touched, email: true });
    if (emailError) return;

    setServerError('');
    setLoading(true);
    try {
      const result = await authApi.requestResetPassword(email);
      setOperationId(result.operation_id);
      setStep('code');
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      if (error?.response?.data?.message?.toLowerCase() == "not found") {
        setServerError(t('errors.emailNotFound'));
        return;
      }
      setServerError(error?.response?.data?.message?.toUpperCase() ?? t('requestResetPassword.failed') ?? 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ ...touched, code: true });
    if (codeError) return;

    setServerError('');
    setLoading(true);
    try {
      const result = await authApi.approveCode(code, operationId);
      if (result.reset_token === null || result.reset_token === undefined || result.reset_token === '' || result.reset_token === 'null' || result.reset_token === 'undefined') {
        setServerError(t('requestResetPassword.codeFailed'));
        return;
      }
      navigate(`/reset-password?reset_token=${result.reset_token}`);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.log(error);
      if (error?.response?.data?.message === 'not found') {
        setServerError(t('requestResetPassword.notFoundCode'));
        return;
      }
      setServerError(error?.response?.data?.message?.toUpperCase() ?? t('requestResetPassword.codeFailed') ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        {step !== "email" && (
          <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStep('email');
                setCode('');
                setTouched({ email: false, code: false });
              }}
            >
              <FaArrowLeft width={40} height={20} />
            </button>
        )}
        <div className="auth-header">
          <h1 className="auth-title">
            {step === 'email' ? t('requestResetPassword.title') || 'Reset Password' : t('requestResetPassword.verifyCode') || 'Verify Code'}
          </h1>
          <p className="text-muted">
            {step === 'email'
              ? t('requestResetPassword.subtitle') || 'Enter your email to receive a reset code'
              : t('requestResetPassword.codeSubtitle') || 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {serverError && <div className="auth-error flex-center">{serverError}</div>}

        {step === 'email' ? (
          <form className="auth-form" onSubmit={handleSubmitEmail} noValidate>
            <div className="form-group">
              <label className="form-label">{t('requestResetPassword.email') || 'Email'}</label>
              <input
                className={`input${touched.email && emailError ? ' input--error' : touched.email && !emailError ? ' input--valid' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                autoFocus
              />
              {touched.email && emailError && <span className="field-error">{emailError}</span>}
            </div>

            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? t('requestResetPassword.sending') || 'Sending...' : t('requestResetPassword.sendCode') || 'Send Code'}
            </button>
          </form>
        ) : (
           <form className="auth-form" onSubmit={handleSubmitCode} noValidate>
            <div className="form-group">
              <label className="form-label">{t('requestResetPassword.code') || 'Verification Code'}</label>
              <div className={`code-inputs${touched.code && codeError ? ' code-inputs--error' : ''}`}>
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    ref={(el) => { codeInputsRef.current[index] = el }}
                    className={`code-input${touched.code && codeError ? ' input--error' : touched.code && !codeError ? ' input--valid' : ''}`}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={codeDigits[index] === ' ' ? '' : codeDigits[index]}
                    onChange={handleCodeChange(index)}
                    onKeyDown={handleCodeKeyDown(index)}
                    onBlur={() => setTouched({ ...touched, code: true })}
                    onPaste={handleCodePaste}
                    autoComplete="one-time-code"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {touched.code && codeError && <span className="field-error">{codeError}</span>}
            </div>

            <div className="form-group">
              <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                {loading ? t('requestResetPassword.verifying') || 'Verifying...' : t('requestResetPassword.verify') || 'Verify Code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
