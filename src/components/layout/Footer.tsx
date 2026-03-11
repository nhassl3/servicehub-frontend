import { useTranslation } from 'react-i18next'
import { BiLogoTelegram } from 'react-icons/bi'
import { BsTwitterX } from 'react-icons/bs'
import { FaTiktok } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import './Footer.css'

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">
            <span>Service</span>
            <span style={{ color: 'var(--color-primary)' }}>Hub</span>
          </span>
          <p className="footer__tagline">{t('footer.tagline')}</p>
          <div className="footer__socials">
            <a href="https://t.me/bichovka" target="_blank" rel="noopener noreferrer">
              <BiLogoTelegram size={26} color="#0088cc" />
            </a>
            <a href="https://x.com/nhassl3" target="_blank" rel="noopener noreferrer">
              <BsTwitterX size={22} color="#090909" />
            </a>
            <a href="https://www.tiktok.com/@bichovka777/video/7486189423168670998" target="_blank" rel="noopener noreferrer">
              <FaTiktok size={22} color="#0a0a0a" />
            </a>
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>{t('footer.marketplace')}</h4>
            <Link to="/catalog">{t('footer.allProducts')}</Link>
            <Link to="/catalog?category=api-services">API Services</Link>
            <Link to="/catalog?category=osint">OSINT Tools</Link>
            <Link to="/catalog?category=parsers">Parsers</Link>
            <Link to="/catalog?category=scripts">Scripts</Link>
          </div>
          <div className="footer__col">
            <h4>{t('footer.account')}</h4>
            <Link to="/profile">{t('footer.profile')}</Link>
            <Link to="/orders">{t('footer.myOrders')}</Link>
            <Link to="/wishlist">{t('footer.wishlist')}</Link>
            <Link to="/sellers/create">{t('footer.becomeSeller')}</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
