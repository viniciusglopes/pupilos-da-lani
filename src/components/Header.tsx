import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-black shadow-lg border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Pupilos da Lani
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white font-medium transition-colors"
            >
              Início
            </Link>
            <Link 
              href="/busca" 
              className="text-gray-300 hover:text-white font-medium transition-colors"
            >
              Buscar
            </Link>
            <Link 
              href="/parceria" 
              className="text-gray-300 hover:text-white font-medium transition-colors"
            >
              Parceiros
            </Link>
            <Link 
              href="/privacidade" 
              className="text-gray-300 hover:text-white font-medium transition-colors"
            >
              Privacidade
            </Link>
            <Link 
              href="/login" 
              className="text-white hover:text-gray-300 font-medium transition-colors bg-gray-800 px-3 py-1 rounded"
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