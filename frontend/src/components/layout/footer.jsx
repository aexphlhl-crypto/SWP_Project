import { Link } from 'react-router-dom'
import { Clapperboard, Facebook, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  company: [
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Tuyển dụng', href: '/careers' },
    { label: 'Liên hệ', href: '/contact' },
  ],
  support: [
    { label: 'Hướng dẫn đặt vé', href: '/help/booking' },
    { label: 'Câu hỏi thường gặp', href: '/faq' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
    { label: 'Điều khoản sử dụng', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-[1400px] py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary transition-transform group-hover:scale-105">
                <Clapperboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Cine<span className="text-primary">Book</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
              Đặt vé xem phim nhanh chóng, tiện lợi. Trải nghiệm điện ảnh đỉnh cao chỉ với vài bước.
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Về CineBook</h3>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>123 Đường ABC, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li>
                <a href="tel:1900123456" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  1900 123 456
                </a>
              </li>
              <li>
                <a href="mailto:support@cinebook.vn" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-primary" />
                  support@cinebook.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border/60" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>&copy; 2026 CineBook. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
