import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import {
  FiAperture, FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUpRight, FiBox,
  FiCheck, FiCheckCircle, FiChevronRight, FiCode, FiDatabase, FiLock, FiMenu,
  FiSearch, FiTerminal, FiX,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { ParticleArt, ParticleField } from '../components/home-preview/ParticleArt'
import { Footer } from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import en from '../i18n/locales/en/homePreview.json'
import ru from '../i18n/locales/ru/homePreview.json'
import './HomePreview.css'

// Keep the prototype's copy in its lazy-loaded route.
i18n.addResourceBundle('en', 'homePreview', en)
i18n.addResourceBundle('ru', 'homePreview', ru)

const categories = [
  { key: 'api', slug: 'api-services', Icon: FiCode },
  { key: 'parsers', slug: 'parsers', Icon: FiDatabase },
  { key: 'scripts', slug: 'scripts', Icon: FiTerminal },
] as const

const steps = [
  { key: 'choose', status: 'selected', Icon: FiBox },
  { key: 'pay', status: 'paid', Icon: FiLock },
  { key: 'track', status: 'delivered', Icon: FiCheckCircle },
] as const

const examples = [
  { key: 'currency', query: 'api' },
  { key: 'prices', query: 'parser' },
  { key: 'tables', query: 'script' },
] as const

function searchUrl(query: string) {
  return query ? '/catalog?' + new URLSearchParams({ q: query }) : '/catalog'
}

function LanguageSwitch() {
  const { t, i18n } = useTranslation('homePreview')
  return (
    <div className="pv-lang" role="group" aria-label={t('nav.language')}>
      {(['ru', 'en'] as const).map(language => (
        <button key={language} type="button" lang={language} aria-label={language === 'ru' ? 'Русский' : 'English'}
          aria-pressed={i18n.resolvedLanguage === language} onClick={() => void i18n.changeLanguage(language)}>
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function PreviewHeader() {
  const { t } = useTranslation('homePreview')
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (open) firstLink.current?.focus({ preventScroll: true })
  }, [open])

  return (
    <header className="pv-header"
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}
      onKeyDown={event => {
        if (open && event.key === 'Escape') {
          setOpen(false)
          menuButton.current?.focus()
        }
      }}>
      <div className="pv-shell pv-header__inner">
        <a className="pv-brand" href="#preview-top" onClick={() => setOpen(false)}>
          <FiAperture aria-hidden="true" />ServiceHub
        </a>
        <nav className="pv-nav" id="preview-nav" aria-label={t('nav.label')} data-open={open}>
          <Link ref={firstLink} to="/catalog" onClick={() => setOpen(false)}>{t('translation:header.catalog')}</Link>
          <a href="#preview-about" onClick={() => setOpen(false)}>{t('nav.how')}</a>
          <a href="#preview-seller" onClick={() => setOpen(false)}>{t('nav.sellers')}</a>
        </nav>
        <div className="pv-header__actions">
          <LanguageSwitch />
          <Link className="pv-account" to={isAuthenticated ? '/profile' : '/login'}>
            {t(isAuthenticated ? 'translation:footer.profile' : 'translation:header.login')}
            <FiArrowUpRight aria-hidden="true" />
          </Link>
          <button className="pv-menu" type="button" ref={menuButton} aria-label={t('nav.menu')}
            aria-controls="preview-nav" aria-expanded={open} onClick={() => setOpen(value => !value)}>
            {open ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}

function HeroSearch() {
  const { t } = useTranslation('homePreview')
  const navigate = useNavigate()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get('q')
    navigate(searchUrl(typeof value === 'string' ? value.trim() : ''))
  }

  return (
    <div className="pv-search">
      <form action="/catalog" role="search" onSubmit={submit}>
        <FiSearch aria-hidden="true" />
        <input name="q" type="search" aria-label={t('hero.searchLabel')} placeholder={t('hero.placeholder')} />
        <button className="pv-button" type="submit">{t('translation:home.search')}<FiArrowRight aria-hidden="true" /></button>
      </form>
      <div className="pv-search__examples">
        <span>{t('hero.examples')}</span>
        {examples.map(({ query }) => (
          <Link key={query} to={searchUrl(t(`hero.${query}`))}>{t(`hero.${query}`)}</Link>
        ))}
      </div>
    </div>
  )
}

function CatalogShowcase() {
  const { t } = useTranslation('homePreview')
  return (
    <section className="pv-catalog pv-shell" id="preview-products" aria-labelledby="preview-products-title" tabIndex={-1}>
      <div className="pv-section-head">
        <h2 id="preview-products-title">{t('catalog.title')}</h2>
        <Link className="pv-text-link" to="/catalog">{t('catalog.all')}<FiArrowUpRight aria-hidden="true" /></Link>
      </div>
      <div className="pv-tiles">
        {categories.map(({ key, slug, Icon }) => (
          <Link className={`pv-tile pv-tile--${key}`} key={key} to={`/catalog?category=${slug}`}>
            <div className="pv-tile__art"><ParticleArt shape={key} /></div>
            <div className="pv-tile__heading">
              <Icon aria-hidden="true" /><h3>{t(`catalog.${key}.title`)}</h3>
              <FiArrowUpRight className="pv-tile__arrow" aria-hidden="true" />
            </div>
            <p>{t(`catalog.${key}.description`)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function BuyingGuide() {
  const { t } = useTranslation('homePreview')
  const [active, setActive] = useState(0)

  return (
    <section className="pv-guide pv-shell" id="preview-about" aria-labelledby="preview-about-title" tabIndex={-1}>
      <div className="pv-guide__copy">
        <h2 id="preview-about-title">{t('how.title')}</h2>
        <div className="pv-steps" role="group" aria-labelledby="preview-about-title">
          {steps.map(({ key }, index) => (
            <button className="pv-step" type="button" key={key} aria-pressed={active === index}
              aria-controls="preview-order" onClick={() => setActive(index)}>
              <span className="pv-step__number">{index + 1}</span>
              <span className="pv-step__copy">
                <span>{t(`how.${key}.title`)}</span>
                {active === index && <span className="pv-step__detail">{t(`how.${key}.description`)}</span>}
              </span>
              <FiChevronRight aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <div className="pv-stage" id="preview-order">
        <div className="pv-ticket">
          <div className="pv-ticket__brand"><FiAperture aria-hidden="true" />ServiceHub</div>
          <p className="pv-ticket__caption">{t('how.sample')}</p>
          <h3>{t('how.product')}</h3>
          <ol className="pv-ticket__timeline">
            {steps.map(({ key, status, Icon }, index) => (
              <li key={key} data-reached={index <= active} aria-current={index === active ? 'step' : undefined}>
                <span>{index < active ? <FiCheck aria-hidden="true" /> : <Icon aria-hidden="true" />}</span>
                {t(`how.${status}`)}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function UseCases() {
  const { t } = useTranslation('homePreview')
  const [active, setActive] = useState(0)
  const example = examples[active]

  function move(direction: number) {
    setActive(index => (index + direction + examples.length) % examples.length)
  }

  return (
    <section className="pv-cases pv-shell" id="preview-reviews" aria-labelledby="preview-cases-title" tabIndex={-1}>
      <h2 id="preview-cases-title">{t('cases.title')}</h2>
      <div className="pv-cases__body">
        <div id="preview-example" aria-live="polite" aria-atomic="true">
          <p className="pv-cases__text" key={example.key}>{t(`cases.${example.key}`)}</p>
        </div>
        <div className="pv-cases__actions">
          <Link className="pv-text-link" to={searchUrl(t(`hero.${example.query}`))}>{t('cases.find')}<FiArrowUpRight aria-hidden="true" /></Link>
          <div className="pv-cases__controls">
            <button type="button" aria-label={t('cases.previous')} aria-controls="preview-example" onClick={() => move(-1)}><FiArrowLeft /></button>
            <span aria-hidden="true">{active + 1} / {examples.length}</span>
            <button type="button" aria-label={t('cases.next')} aria-controls="preview-example" onClick={() => move(1)}><FiArrowRight /></button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomePreview() {
  const { t, i18n } = useTranslation('homePreview')
  const { user } = useAuth()
  const seller = user?.role === 'seller'

  useEffect(() => {
    // Vite loads this route lazily, after the browser's initial fragment lookup.
    const { hash } = window.location
    if (hash.startsWith('#preview-')) {
      const target = document.getElementById(hash.slice(1))
      target?.focus({ preventScroll: true })
      target?.scrollIntoView({ behavior: 'instant' })
    }
  }, [])

  return (
    <div className="pv" id="preview-top" lang={i18n.resolvedLanguage}>
      <PreviewHeader />
      <main>
        <section className="pv-hero" aria-labelledby="preview-title">
          <ParticleField />
          <div className="pv-hero__art" aria-hidden="true"><ParticleArt shape="hub" /></div>
          <div className="pv-shell pv-hero__inner">
            <div className="pv-hero__copy">
              <h1 id="preview-title">{t('hero.first')}<br />{t('hero.second')}</h1>
              <p>{t('hero.description')}</p>
              <HeroSearch />
            </div>
          </div>
          <a className="pv-hero__down" href="#preview-products" aria-label={t('catalog.title')}><FiArrowDown aria-hidden="true" /></a>
        </section>
        <CatalogShowcase />
        <BuyingGuide />
        <UseCases />
        <section className="pv-seller" id="preview-seller" aria-labelledby="preview-seller-title" tabIndex={-1}>
          <ParticleField />
          <div className="pv-shell">
            <h2 id="preview-seller-title">{t('seller.title')}</h2>
            <p>{t('seller.description')}</p>
            <Link className="pv-button" to={seller ? '/seller/dashboard' : '/sellers/create'}>
              {t(seller ? 'seller.dashboard' : 'translation:footer.becomeSeller')}<FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer previewControls={<LanguageSwitch />} />
    </div>
  )
}
