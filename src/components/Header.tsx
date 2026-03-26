import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">PL</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
              Pupilos da Lani
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-purple-700 font-medium transition-colors relative group"
            >
              Início
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-700 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/busca" 
              className="text-gray-700 hover:text-purple-700 font-medium transition-colors relative group"
            >
              Talentos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-700 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/parceria" 
              className="text-gray-700 hover:text-purple-700 font-medium transition-colors relative group"
            >
              Seja Modelo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-700 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/privacidade" 
              className="text-gray-700 hover:text-purple-700 font-medium transition-colors relative group"
            >
              Privacidade
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-700 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold px-6 py-2 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50 p-2 text-gray-700 hover:text-purple-700 transition-colors"
            >
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 top-3' : 'top-1'
                  }`}
                />
                <span
                  className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 top-3 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 top-3' : 'top-5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 md:hidden transform transition-transform duration-300">
              <div className="p-8 pt-20">
                {/* Mobile Navigation Links */}
                <nav className="space-y-6">
                  <Link 
                    href="/" 
                    className="block text-2xl font-semibold text-gray-900 hover:text-purple-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🏠 Início
                  </Link>
                  <Link 
                    href="/busca" 
                    className="block text-2xl font-semibold text-gray-900 hover:text-purple-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🎭 Talentos
                  </Link>
                  <Link 
                    href="/parceria" 
                    className="block text-2xl font-semibold text-gray-900 hover:text-purple-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🌟 Seja Modelo
                  </Link>
                  <Link 
                    href="/privacidade" 
                    className="block text-2xl font-semibold text-gray-900 hover:text-purple-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📋 Privacidade
                  </Link>
                  
                  {/* Admin Button for Mobile */}
                  <div className="pt-6 border-t border-gray-200">
                    <Link 
                      href="/login" 
                      className="block w-full text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🔐 Área Administrativa
                    </Link>
                  </div>
                </nav>

                {/* Footer info */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">PL</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pupilos da Lani</h3>
                    <p className="text-gray-600 text-sm">
                      Conectando talentos com oportunidades em Minas Gerais
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}