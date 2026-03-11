import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './Header.css'

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const switchLang = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const close = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" onClick={close}>
          <span className="header__logo-service">Service</span>
          <span className="header__logo-hub">Hub</span>
        </Link>

        <nav className={`header__nav${menuOpen ? ' open' : ''}`}>
          <Link to="/catalog" className="header__nav-link" onClick={close}>{t('header.catalog')}</Link>
          <Link to="/sellers/create" className="header__nav-link" onClick={close}>{t('header.becomeSeller')}</Link>

          {/* Mobile-only: auth + lang inside burger dropdown */}
          <div className="header__nav-mobile-auth">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="header__nav-link header__nav-link--accent" onClick={close}>{user?.username}</Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">{t('header.logout')}</button>
              </>
            ) : (
              <div className="header__nav-auth-btns">
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={close}>{t('header.login')}</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>{t('header.signUp')}</Link>
              </div>
            )}
            <div className="header__lang">
              <button
                className={`header__lang-btn${i18n.language.startsWith('en') ? ' active' : ''}`}
                onClick={() => switchLang('en')}
              >EN</button>
              <button
                className={`header__lang-btn${i18n.language.startsWith('ru') ? ' active' : ''}`}
                onClick={() => switchLang('ru')}
              >RU</button>
            </div>
          </div>
        </nav>

        <div className="header__actions">
          <div className="header__lang header__lang--desktop">
            <button
              className={`header__lang-btn${i18n.language.startsWith('en') ? ' active' : ''}`}
              onClick={() => switchLang('en')}
            >EN</button>
            <button
              className={`header__lang-btn${i18n.language.startsWith('ru') ? ' active' : ''}`}
              onClick={() => switchLang('ru')}
            >RU</button>
          </div>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="header__cart" onClick={close}>
                <svg className="header__cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.72L23 6H6"/>
                </svg>
                <span className="header__cart-label">{t('header.cart')}</span>
                {itemCount > 0 && <span className="header__cart-badge">{itemCount}</span>}
              </Link>
              <div className="header__user header__user--desktop">
                <Link to="/profile" className="header__username" onClick={close}>{user?.username}</Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">{t('header.logout')}</button>
              </div>
            </>
          ) : (
            <div className="header__auth header__auth--desktop">
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={close}>{t('header.login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>{t('header.signUp')}</Link>
            </div>
          )}

          <button
            className={`header__burger${menuOpen ? ' header__burger--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
