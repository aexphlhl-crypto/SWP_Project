"use client"

import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Menu,
  X,
  User,
  Ticket,
  LogOut,
  LayoutDashboard,
  Clapperboard,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react'

const mainNavItems = [
  { label: 'Đang Chiếu', href: '/movies/now-showing' },
  { label: 'Sắp Chiếu', href: '/movies/coming-soon' },
  { label: 'Rạp Chiếu', href: '/cinemas' },
  { label: 'Tin Tức', href: '/news' },
  { label: 'Trao Đổi Vé', href: '/resale' },
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex h-[68px] items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary transition-transform group-hover:scale-105">
              <Clapperboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline-block">
              Cine<span className="text-primary">Book</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-semibold transition-colors rounded-md ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Search + Right */}
          <div className="flex items-center gap-2.5">
            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm phim, diễn viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-52 pl-9 pr-3 h-9 bg-muted border-input focus:border-primary/60 focus:bg-background text-sm transition-all focus:w-64"
                />
              </div>
            </form>

            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Language Switcher Mockup */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
              <span className="cursor-pointer hover:text-primary text-primary transition-colors">VI</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="cursor-pointer hover:text-primary transition-colors">EN</span>
            </div>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 text-muted-foreground hover:text-foreground relative rounded-lg"
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none">
                    <Avatar className="h-7 w-7 border border-primary/50">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block text-sm font-medium max-w-[90px] truncate">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Trang Quản Trị
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Tài khoản
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'user' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/my-tickets" className="cursor-pointer">
                          <Ticket className="mr-2 h-4 w-4" />
                          Vé của tôi
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/my-resale" className="cursor-pointer">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Vé bán lại
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-border">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm phim, diễn viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-muted border-input"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile nav menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-3 border-t border-border">
            <div className="flex flex-col gap-0.5">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors sm:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
