import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BiLogoTelegram } from 'react-icons/bi'
import { BsTwitterX } from 'react-icons/bs'
import { FaTiktok } from 'react-icons/fa6'
import { FiAperture } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './Footer.css'

function SocialLinks() {
  return (
    <div className="footer__socials">
      <a href="https://t.me/bichovka" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
        <BiLogoTelegram size={26} color="var(--footer-social-ink, #0088cc)" />
      </a>
      <a href="https://x.com/nhassl3" target="_blank" rel="noopener noreferrer" aria-label="X">
        <BsTwitterX size={22} color="var(--footer-social-ink, #090909)" />
      </a>
      <a href="https://www.tiktok.com/@bichovka777/video/7486189423168670998" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <FaTiktok size={22} color="var(--footer-social-ink, #0a0a0a)" />
      </a>
    </div>
  )
}

export function Footer({ previewControls }: { previewControls?: ReactNode }) {
  const { t } = useTranslation();
  const preview = previewControls != null;

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">
            {preview && <FiAperture aria-hidden="true" />}
            <span>Service</span>
            <span style={{ color: 'var(--color-primary)' }}>Hub</span>
          </span>
          <p className="footer__tagline">{t('footer.tagline')}</p>
          {!preview && <SocialLinks />}
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>{t('footer.marketplace')}</h4>
            <Link to="/catalog">{t('footer.allProducts')}</Link>
            <Link to="/catalog?category=api-services">{t('footer.apiServices')}</Link>
            <Link to="/catalog?category=osint">{t('footer.osintTools')}</Link>
            <Link to="/catalog?category=parsers">{t('footer.parsers')}</Link>
            <Link to="/catalog?category=scripts">{t('footer.scripts')}</Link>
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
          {preview && <div className="footer__utilities"><SocialLinks />{previewControls}</div>}
        </div>
      </div>
    </footer>
  );
}
