import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-lg font-bold tracking-tight uppercase mb-4">Pupilos da Lani</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Conectando talentos com oportunidades.<br />
              Modelos profissionais em Minas Gerais.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">Navegação</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Início' },
                { href: '/busca', label: 'Talentos' },
                { href: '/parceria', label: 'Seja Modelo' },
                { href: '/privacidade', label: 'Privacidade' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">Contato</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>Minas Gerais, Brasil</p>
              <p>contato@pupiloslani.com.br</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-xs tracking-wide">
            © 2026 Pupilos da Lani. Todos os direitos reservados.
          </p>
          <p className="text-gray-700 text-xs mt-2 md:mt-0">
            LGPD Compliance
          </p>
        </div>
      </div>
    </footer>
  )
}
