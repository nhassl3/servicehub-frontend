import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import './Layout.css'

export function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
