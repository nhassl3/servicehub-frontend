import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './Header.css'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">
          <span className="header__logo-service">Service</span>
          <span className="header__logo-hub">Hub</span>
        </Link>

        <nav className="header__nav">
          <Link to="/catalog" className="header__nav-link">Catalog</Link>
          <Link to="/catalog?category=api-services" className="header__nav-link">API</Link>
          <Link to="/catalog?category=osint" className="header__nav-link">OSINT</Link>
          <Link to="/catalog?category=scripts" className="header__nav-link">Scripts</Link>
        </nav>

        <div className="header__actions">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="header__cart">
                <span>Cart</span>
                {itemCount > 0 && <span className="header__cart-badge">{itemCount}</span>}
              </Link>
              <div className="header__user">
                <Link to="/profile" className="header__username">{user?.username}</Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
