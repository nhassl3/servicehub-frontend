import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

const PATTERNS = {
  username: /^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$/,
  password: /^[a-zA-Z0-9!@#$%^&*()\-_=+\[\]{};:'",.<>?\\|`~]{8,}$/,
};

type FormKey = 'username' | 'password';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<Record<FormKey, string>>({ username: '', password: '' });
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleChangePasswordButton, setVisibleChangePasswordButton] = useState(false);

  const validate = (field: FormKey, value: string): string => {
    if (!value) return t('validation.required');
    return !PATTERNS[field].test(value)
      ? (field === 'username' ? t('validation.username') : t('validation.password'))
      : '';
  };

  const errors: Record<FormKey, string> = {
    username: validate('username', form.username),
    password: validate('password', form.password),
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const set = (key: FormKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const touch = (key: FormKey) => () =>
    setTouched(t => ({ ...t, [key]: true }));

  const showError = (key: FormKey) => touched[key] && errors[key];

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (hasErrors) return;
    setServerError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err: any) {
      if (err?.response?.data?.message == "invalid credentials") {
        setVisibleChangePasswordButton(true);
      }
      setServerError(err?.response?.data?.message.toLocaleUpperCase() ?? t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleYandexLogin = () => {
    window.location.href = '/api/v1/auth/yandex';
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-title">{t('login.title')}</h1>
          <p className="text-muted">{t('login.subtitle')}</p>
        </div>

        {serverError && <div className="auth-error flex-center">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">{t('login.username')}</label>
            <input
              className={`input${showError('username') ? ' input--error' : touched.username && !errors.username ? ' input--valid' : ''}`}
              type="text"
              placeholder="your_username"
              value={form.username}
              onChange={set('username')}
              onBlur={touch('username')}
              autoFocus
            />
            {showError('username') && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('login.password')}</label>
            <input
              className={`input${showError('password') ? ' input--error' : touched.password && !errors.password ? ' input--valid' : ''}`}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              onBlur={touch('password')}
            />
            {showError('password') && <span className="field-error">{errors.password}</span>}
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        <div className="auth-separator">или</div>

        <button
          type="button"
          className="btn auth-yandex-button auth-submit"
          onClick={handleYandexLogin}
        >
          <span className="auth-yandex-icon">Я</span>
          {t('login.signInWithYandex') || 'Войти через Yandex ID'}
        </button>

        {visibleChangePasswordButton && (
          <p className="auth-footer text-muted">
            {t('login.forgotPassword')}{' '}
            <Link to="/reset-password" className="text-primary">{t('login.resetPassword')}</Link>
          </p>
        )}

        <p className="auth-footer text-muted">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-primary">{t('login.signUp')}</Link>
        </p>
      </div>
    </div>
  );
}
