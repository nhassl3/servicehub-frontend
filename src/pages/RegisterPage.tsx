import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

const PATTERNS = {
  username: /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/,
  password: /^[a-zA-Z0-9!@#$%^&*()\-_=+\[\]{};:'",.<>?\\|`~]{8,}$/,
  full_name: /^[A-Za-zА-Яа-яЁё\-' ]{2,100}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

type FormKey = 'username' | 'email' | 'full_name' | 'password' | 'confirm';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<Record<FormKey, string>>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm: '',
  });
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (field: FormKey, value: string): string => {
    if (!value) return t('validation.required');
    if (field === 'confirm') return value === form.password ? '' : t('validation.confirm');
    const pattern = PATTERNS[field as keyof typeof PATTERNS];
    const messages: Record<string, string> = {
      username: t('validation.usernameExample'),
      password: t('validation.passwordDetail'),
      full_name: t('validation.fullName'),
      email: t('validation.email'),
    };
    return pattern && !pattern.test(value) ? messages[field] : '';
  };

  const errors: Record<FormKey, string> = {
    username: validate('username', form.username),
    email: validate('email', form.email),
    full_name: validate('full_name', form.full_name),
    password: validate('password', form.password),
    confirm: validate('confirm', form.confirm),
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const set = (key: FormKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
  };

  const touch = (key: FormKey) => () =>
    setTouched(t => ({ ...t, [key]: true }));

  const showError = (key: FormKey) => touched[key] && errors[key];

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ username: true, email: true, full_name: true, password: true, confirm: true });
    if (hasErrors) return;
    setServerError('');
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        full_name: form.full_name,
        password: form.password,
      });
      navigate('/');
    } catch (err: any) {
      setServerError(err?.response?.data?.message.toLocaleUpperCase() ?? t('register.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const field = (key: FormKey, label: string, type: string, placeholder: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className={`input${showError(key) ? ' input--error' : touched[key] && !errors[key] ? ' input--valid' : ''}`}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={set(key)}
        onBlur={touch(key)}
        {...extra}
      />
      {showError(key) && <span className="field-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-title">{t('register.title')}</h1>
          <p className="text-muted">{t('register.subtitle')}</p>
        </div>

        {serverError && <div className="auth-error flex-center">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            {field('username', t('register.username'), 'text', 'john-doe', { autoFocus: true })}
            {field('full_name', t('register.fullName'), 'text', 'John Doe')}
          </div>

          {field('email', t('register.email'), 'email', 'you@example.com')}

          <div className="form-row">
            {field('password', t('register.password'), 'password', '••••••••')}
            {field('confirm', t('register.confirmPassword'), 'password', '••••••••')}
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? t('register.creating') : t('register.createAccount')}
          </button>
        </form>

        <p className="auth-footer text-muted">
          {t('register.hasAccount')}{' '}
          <Link to="/login" className="text-primary">{t('register.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
