import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.documentElement.scrollTo({
          top: 1,
          behavior: "smooth"
        });
      }, 100);
    });
  }, [pathname]);

  return null;
}