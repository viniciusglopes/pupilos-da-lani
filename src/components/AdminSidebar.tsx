'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      description: 'Visao geral'
    },
    {
      title: 'Gerenciar Pupilos',
      href: '/admin/modelos',
      description: 'Ver e editar cadastros'
    },
    {
      title: 'Novo Pupilo',
      href: '/admin/cadastro',
      description: 'Cadastrar novo pupilo'
    },
    {
      title: 'Configurar Homepage',
      href: '/admin/homepage-config',
      description: 'Controlar secoes da pagina inicial'
    },
    {
      title: 'Pagina Principal',
      href: '/admin/homepage',
      description: 'Editar textos da home'
    },
    {
      title: 'Pagina Parceria',
      href: '/admin/parceria',
      description: 'Editar textos da parceria'
    },
    {
      title: 'Editor Footer',
      href: '/admin/footer',
      description: 'Personalizar rodape'
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      description: 'Estatisticas e metricas'
    },
    {
      title: 'Debug Portal',
      href: '/admin/debug',
      description: 'Informacoes tecnicas'
    },
    {
      title: 'Administradores',
      href: '/admin/admins',
      description: 'Gerenciar acesso'
    },
    {
      title: 'Campos Visiveis',
      href: '/admin/campos-visibilidade',
      description: 'Controlar exibicao pagina pupilo'
    },
    {
      title: 'Configuracoes',
      href: '/admin/config',
      description: 'Configuracoes do sistema'
    },
    {
      title: 'Sair',
      href: '#logout',
      description: 'Encerrar sessao admin',
      isLogout: true
    }
  ]

  const logout = () => {
    localStorage.removeItem('admin_authenticated')
    router.push('/login')
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 border border-gray-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 transform transition-transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-black text-white">
            <h1 className="text-sm font-bold uppercase tracking-widest">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              
              if (item.isLogout) {
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center px-4 py-3 transition-colors border-l-2 text-red-600 hover:bg-red-50 border-transparent hover:border-red-300"
                  >
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium uppercase tracking-wide">{item.title}</div>
                      <div className="text-xs text-red-400">{item.description}</div>
                    </div>
                  </button>
                )
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-4 py-3 transition-colors border-l-2
                    ${isActive 
                      ? 'bg-gray-100 text-black border-black' 
                      : 'text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium uppercase tracking-wide">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Administrador</div>
                <div className="text-xs text-gray-400">admin@pupiloslani.com.br</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
