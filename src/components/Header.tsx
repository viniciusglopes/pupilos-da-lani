import Link from 'next/link'

export default function Header() {
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

          {/* Menu mobile */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}