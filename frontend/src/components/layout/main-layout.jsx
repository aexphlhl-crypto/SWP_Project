import { Navbar } from './navbar'
import { Footer } from './footer'

export function MainLayout({ children, showHeader = true, showFooter = true }) {
  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && <Navbar />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}
