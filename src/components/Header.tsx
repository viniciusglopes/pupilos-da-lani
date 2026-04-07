'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface MenuItem {
  label: string
  href: string
}

interface SiteConfig {
  logo_url: string
  logo_texto: string
  menu_items: MenuItem[]
}

const DEFAULT_CONFIG: SiteConfig = {
  logo_url: '',
  logo_texto: 'Pupilos da Lani',
  menu_items: [
    { label: 'Início', href: '/' },
    { label: 'Talentos', href: '/busca' },
  ]
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    fetch('/api/config/site')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.success && data.config) {
          setConfig({ ...DEFAULT_CONFIG, ...data.config })
        }
      })
      .catch(() => {})
  }, [])

  const navItems = [...(config.menu_items || DEFAULT_CONFIG.menu_items)]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            {config.logo_url ? (
              <Image
                src={config.logo_url}
                alt={config.logo_texto || 'Logo'}
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
                unoptimized
              />
            ) : (
              <span className="text-xl font-bold tracking-tight text-black uppercase">
                {config.logo_texto || DEFAULT_CONFIG.logo_texto}
              </span>
            )}
          </Link>

          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors tracking-wide uppercase"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-black transition-colors tracking-wide uppercase"
            >
              Admin
            </Link>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-black"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`block h-px w-6 bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-px w-6 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-6 bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pt-6 pb-2 space-y-4 border-t border-gray-200 mt-5">
            {navItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-gray-700 hover:text-black tracking-wide uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block text-sm font-medium text-gray-400 hover:text-black tracking-wide uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
