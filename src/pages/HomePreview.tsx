import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent, PointerEvent } from 'react'
import { FiArrowDown, FiArrowLeft, FiArrowRight, FiCheckCircle, FiClock, FiLock, FiMessageSquare, FiSearch } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import apiPhoto from '../assets/home-preview/api.jpg'
import dataPhoto from '../assets/home-preview/data.jpg'
import scriptsPhoto from '../assets/home-preview/scripts.jpg'
import workspacePhoto from '../assets/home-preview/workspace.jpg'
import './HomePreview.css'

const searchExamples = ['API для сайта', 'Парсер цен', 'Скрипт для Excel']

const benefits = [
  { Icon: FiCheckCircle, title: 'Проверяем перед публикацией', description: 'Администратор проверяет услугу до того, как она появится в каталоге.' },
  { Icon: FiClock, title: 'Находите готовый инструмент', description: 'Сравните предложения и оформите заказ через ServiceHub.' },
  { Icon: FiLock, title: 'Резервируем оплату', description: 'Деньги остаются в резерве до завершения сделки.' },
]

const reviews = [
  { quote: 'Подобрали API для проекта и проверили документацию перед покупкой.', role: 'Интеграция', initials: 'И' },
  { quote: 'Готовый скрипт помог убрать ручную работу с таблицами.', role: 'Автоматизация', initials: 'А' },
  { quote: 'В описании парсера сразу было понятно, какие данные можно выгрузить.', role: 'Сбор данных', initials: 'С' },
]

const products = [
  { title: 'API для интеграций', category: 'API-сервисы', query: 'API', hit: true, price: '990', photo: apiPhoto, description: 'Подключайте данные и сервисы к своим приложениям.' },
  { title: 'Парсер маркетплейсов', category: 'Парсеры', query: 'парсер', hit: false, price: '1 490', photo: dataPhoto, description: 'Собирайте цены, остатки и характеристики товаров.' },
  { title: 'Скрипты для автоматизации', category: 'Скрипты', query: 'скрипт', hit: false, price: '790', photo: scriptsPhoto, description: 'Убирайте ручные операции с файлами и таблицами.' },
]

function catalogUrl(query = '') {
  return query ? '/catalog?' + new URLSearchParams({ q: query }).toString() : '/catalog'
}

function trackBorderLight(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== 'mouse' || !(event.target instanceof Element) || event.target.closest('.sh-preview__header, footer')) return

  for (let surface = event.target.closest<HTMLElement>('a, button, form');
    surface && event.currentTarget.contains(surface);
    surface = surface.parentElement?.closest<HTMLElement>('a, button, form') ?? null) {
    const { left, top } = surface.getBoundingClientRect()
    surface.dataset.pointerLight = 'true'
    surface.style.setProperty('--pointer-x', `${event.clientX - left}px`)
    surface.style.setProperty('--pointer-y', `${event.clientY - top}px`)
  }
}

function scrollToSection(event: MouseEvent<HTMLDivElement>) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#preview-"]') : null
  const section = link && document.getElementById(link.hash.slice(1))
  if (!section || !link) return
  event.preventDefault()
  if (location.hash !== link.hash) history.pushState(history.state, '', link.hash)
  section.tabIndex = -1
  section.focus({ preventScroll: true })
  section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}

function Search() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(catalogUrl(query.trim()))
  }

  return (
    <form className="sh-preview__search" role="search" onSubmit={submit}>
      <FiSearch aria-hidden="true" />
      <div className="sh-preview__search-field">
        <input aria-label="Поиск по каталогу" type="search" value={query}
          placeholder="Поиск по каталогу"
          onChange={event => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        {!focused && !query && (
          <div className="sh-preview__ticker" aria-hidden="true">
            <div className="sh-preview__ticker-track">
              {[0, 1].map(copy => <span key={copy}>{searchExamples.join('     ·     ')}{'     ·     '}</span>)}
            </div>
          </div>
        )}
      </div>
      <button className="sh-preview__button" type="submit">Найти</button>
    </form>
  )
}

function HeroBackground() {
  const sky = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = sky.current
    if (!element || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div className="sh-preview__sky" ref={sky} aria-hidden="true"><div /><div /><div /></div>
}

function ReviewStack() {
  const [active, setActive] = useState(0)

  function advance(direction: number) {
    setActive(current => (current + direction + reviews.length) % reviews.length)
  }

  return (
    <div className="sh-preview__reviews-layout sh-preview__wrap">
      <div className="sh-preview__reviews-copy">
        <h2 id="preview-reviews-title">Отзывы о покупках</h2>
        <p>Примеры отзывов об инструментах из каталога.</p>
      </div>
      <div className="sh-preview__review-panel">
        <div className="sh-preview__review-stack" id="preview-review-stack" aria-live="polite">
          {reviews.map((review, index) => {
            const depth = (index - active + reviews.length) % reviews.length
            return (
              <figure className="sh-preview__review" key={review.role} data-depth={depth} aria-hidden={depth !== 0}>
                <FiMessageSquare aria-hidden="true" />
                <blockquote>{review.quote}</blockquote>
                <figcaption><span aria-hidden="true">{review.initials}</span>{review.role}</figcaption>
              </figure>
            )
          })}
        </div>
        <div className="sh-preview__review-controls">
          <button className="sh-preview__button sh-preview__button--outline" type="button" aria-label="Предыдущий отзыв"
            aria-controls="preview-review-stack" onClick={() => advance(-1)}><FiArrowLeft aria-hidden="true" /></button>
          <span aria-hidden="true">{active + 1} / {reviews.length}</span>
          <button className="sh-preview__button sh-preview__button--outline" type="button" aria-label="Следующий отзыв"
            aria-controls="preview-review-stack" onClick={() => advance(1)}><FiArrowRight aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  )
}

function SectionBridge() {
  return <div className="sh-preview__bridge" aria-hidden="true"><span /></div>
}

export function HomePreview() {
  const page = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panels = page.current?.querySelectorAll<HTMLElement>('.sh-preview__section:not(.sh-preview__hero) > .sh-preview__wrap')
    if (!panels || !('IntersectionObserver' in window)) return
    const bridges = page.current?.querySelectorAll<HTMLElement>('.sh-preview__bridge')

    const observer = new IntersectionObserver(entries => {
      for (const { isIntersecting, target } of entries) {
        if (target instanceof HTMLElement && target.classList.contains('sh-preview__bridge')) {
          target.toggleAttribute('data-crossing', isIntersecting)
          continue
        }
        const section = target.parentElement
        if (!section) continue
        if (isIntersecting) {
          section.dataset.reveal = 'entered'
          observer.unobserve(target)
        } else if (!section.dataset.reveal) {
          section.dataset.reveal = 'pending'
        }
      }
    }, { rootMargin: '0px 0px -12% 0px' })
    panels.forEach(panel => observer.observe(panel))
    bridges?.forEach(bridge => observer.observe(bridge))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="sh-preview" ref={page} onClick={scrollToSection} onPointerMove={trackBorderLight}>
      <header className="sh-preview__header">
        <div className="sh-preview__top sh-preview__wrap">
          <Link className="sh-preview__brand" to="/preview/2.0">Service<span>Hub</span></Link>
          <nav aria-label="Главное меню">
            <Link to="/catalog">Каталог</Link>
            <a href="#preview-seller">Продавцам</a>
            <Link to="/login">Войти</Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="sh-preview__section sh-preview__hero" aria-labelledby="preview-title">
          <HeroBackground />
          <div className="sh-preview__wrap sh-preview__hero-content">
            <h1 id="preview-title">Найдите инструмент{' '}<br />для <em>своей задачи</em></h1>
            <p>API, парсеры, скрипты и цифровые услуги в одном каталоге.</p>
            <Search />
            <div className="sh-preview__hero-links">
              <Link to="/catalog">Открыть каталог <FiArrowRight aria-hidden="true" /></Link>
              <a href="#preview-about">Как это работает <FiArrowDown aria-hidden="true" /></a>
            </div>
          </div>
          <div className="sh-preview__hero-base sh-preview__wrap">
            <span><FiLock aria-hidden="true" /> Защита оплаты</span>
            <span><FiCheckCircle aria-hidden="true" /> Модерация услуг</span>
          </div>
        </section>

        <section className="sh-preview__section sh-preview__about" id="preview-about" aria-labelledby="preview-about-title">
          <SectionBridge />
          <div className="sh-preview__wrap sh-preview__split">
            <div>
              <h2 id="preview-about-title">Покупайте с уверенностью</h2>
              <p>ServiceHub объединяет каталог цифровых инструментов и безопасное оформление сделки.</p>
              <Link className="sh-preview__button sh-preview__button--outline" to="/catalog">Посмотреть каталог <FiArrowRight aria-hidden="true" /></Link>
            </div>
            <ol className="sh-preview__benefits">
              {benefits.map(({ Icon, title, description }) => (
                <li key={title}><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div></li>
              ))}
            </ol>
          </div>
          <a className="sh-preview__next" href="#preview-reviews">Отзывы <FiArrowDown aria-hidden="true" /></a>
        </section>

        <section className="sh-preview__section sh-preview__reviews" id="preview-reviews" aria-labelledby="preview-reviews-title">
          <SectionBridge />
          <ReviewStack />
          <a className="sh-preview__next" href="#preview-products">Популярные товары <FiArrowDown aria-hidden="true" /></a>
        </section>

        <section className="sh-preview__section sh-preview__products" id="preview-products" aria-labelledby="preview-products-title">
          <SectionBridge />
          <div className="sh-preview__wrap">
            <div className="sh-preview__section-head">
              <div><h2 id="preview-products-title">Популярное в каталоге</h2><p>Примеры товаров и цен для прототипа.</p></div>
              <Link className="sh-preview__button sh-preview__button--outline" to="/catalog">Весь каталог <FiArrowRight aria-hidden="true" /></Link>
            </div>
            <div className="sh-preview__grid sh-preview__product-grid">
              {products.map(product => (
                <Link className="sh-preview__product" key={product.title} to={catalogUrl(product.query)}>
                  <div className="sh-preview__product-image">
                    <img src={product.photo} width="720" height="440" alt="" loading="lazy" />
                  </div>
                  <div className="sh-preview__product-info">
                    <span>{product.category}</span>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <div className="sh-preview__product-bottom">
                      {product.hit && <span className="sh-preview__hit">Хит</span>}
                      <strong>от {product.price} ₽</strong>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <a className="sh-preview__next" href="#preview-seller">Продавцам <FiArrowDown aria-hidden="true" /></a>
        </section>

        <section className="sh-preview__section sh-preview__seller" id="preview-seller" aria-labelledby="preview-seller-title">
          <SectionBridge />
          <div className="sh-preview__wrap sh-preview__split">
            <div>
              <h2 id="preview-seller-title">Продавайте на ServiceHub</h2>
              <p>Размещайте свои API, скрипты и программы. После модерации предложение появится в каталоге.</p>
              <Link className="sh-preview__button" to="/sellers/create">Стать продавцом <FiArrowRight aria-hidden="true" /></Link>
            </div>
            <img className="sh-preview__workspace" src={workspacePhoto} width="1100" height="850" alt="" loading="lazy" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
