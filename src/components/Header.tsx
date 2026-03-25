import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Pupilos da Lani
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Todos os Modelos
            </Link>
            <Link 
              href="/parceria" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Parceiros
            </Link>
            <Link 
              href="/privacidade" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Privacidade
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