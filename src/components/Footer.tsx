import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Pupilos da Lani</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Conectando talentos com oportunidades. 
              Plataforma profissional para modelos em Minas Gerais.
            </p>
            <p className="text-gray-400 text-sm">
              Em conformidade com a LGPD - Lei Geral de Proteção de Dados
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Todos os Modelos
                </Link>
              </li>
              <li>
                <Link href="/parceria" className="text-gray-300 hover:text-white transition-colors">
                  Modelos Parceiros
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-gray-300">
              <p>Minas Gerais, Brasil</p>
              <p>contato@pupiloslani.com.br</p>
              <p>(31) 9 9999-9999</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2026 Pupilos da Lani. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Desenvolvido com ❤️ em Minas Gerais
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}