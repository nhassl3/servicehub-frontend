import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth'
import './AuthPage.css'

const PATTERNS = {
  password: /^[a-zA-Z0-9!@#$%^&*()\-_=+\[\]{};:'",.<>?\\|`~]{8,}$/,
};

type FormKey = 'password' | 'confirm';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<Record<FormKey, string>>({ password: '', confirm: '' });
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    const token = searchParams.get('reset_token');

    if (!token || token === 'null' || token === 'undefined') {
      setTokenError(t('validation.required') || 'Reset token is missing');
      setTimeout(() => navigate('/request-reset-password'), 3000);
      return;
    }
    setResetToken(token);
  }, [searchParams, navigate, t]);

  const validate = (field: FormKey, value: string): string => {
    if (!value) return t('validation.required');
    if (field === 'confirm') return value === form.password ? '' : t('validation.confirm');
    return !PATTERNS.password.test(value) ? t('validation.passwordDetail') : '';
  };

  const errors: Record<FormKey, string> = {
    password: validate('password', form.password),
    confirm: validate('confirm', form.confirm),
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const set = (key: FormKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const touch = (key: FormKey) => () =>
    setTouched(t => ({ ...t, [key]: true }));

  const showError = (key: FormKey) => touched[key] && errors[key];

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (hasErrors || !resetToken) return;

    setServerError('');
    setLoading(true);
    try {
      await authApi.resetPassword(form.password, resetToken);
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.log(error);
      setServerError(error?.response?.data?.message?.toUpperCase() ?? t('resetPassword.failed') ?? 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <div className="auth-error flex-center">{tokenError}</div>
          <p className="text-muted" style={{ textAlign: 'center', marginTop: '1rem' }}>
            {t('resetPassword.redirecting') || 'Redirecting to reset password request...'}
          </p>
        </div>
      </div>
    );
  }

  if (!resetToken) {
    return null;
  }

  const field = (key: FormKey, label: string, type: string, placeholder: string) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className={`input${showError(key) ? ' input--error' : touched[key] && !errors[key] ? ' input--valid' : ''}`}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={set(key)}
        onBlur={touch(key)}
        autoFocus={key === 'password'}
      />
      {showError(key) && <span className="field-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-title">{t('resetPassword.title') || 'Set New Password'}</h1>
          <p className="text-muted">{t('resetPassword.subtitle') || 'Enter your new password'}</p>
        </div>

        {serverError && <div className="auth-error flex-center">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {field('password', t('resetPassword.newPassword') || 'New Password', 'password', '••••••••')}
          {field('confirm', t('resetPassword.confirmPassword') || 'Confirm Password', 'password', '••••••••')}

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading || hasErrors}>
            {loading ? t('resetPassword.resetting') || 'Resetting...' : t('resetPassword.reset') || 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
