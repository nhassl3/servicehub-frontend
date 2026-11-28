import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.location.hash) return;
    let timer: number;
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        if (window.location.hash) return;
        document.documentElement.scrollTo({
          top: 1,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
        });
      }, 100);
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
