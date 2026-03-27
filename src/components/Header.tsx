'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-black uppercase">
            Pupilos da Lani
          </Link>

          <nav className="hidden md:flex items-center space-x-10">
            {[
              { href: '/', label: 'Início' },
              { href: '/busca', label: 'Talentos' },
              { href: '/parceria', label: 'Seja Modelo' },
            ].map((link) => (
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
            {[
              { href: '/', label: 'Início' },
              { href: '/busca', label: 'Talentos' },
              { href: '/parceria', label: 'Seja Modelo' },
              { href: '/login', label: 'Admin' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-gray-700 hover:text-black tracking-wide uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
