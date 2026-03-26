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
      icon: '📊',
      description: 'Visão geral'
    },
    {
      title: 'Gerenciar Modelos',
      href: '/admin/modelos',
      icon: '👥',
      description: 'Ver e editar cadastros'
    },
    {
      title: 'Novo Modelo',
      href: '/admin/cadastro',
      icon: '➕',
      description: 'Cadastrar novo modelo'
    },
    {
      title: 'Administradores',
      href: '/admin/admins',
      icon: '🔐',
      description: 'Gerenciar acesso'
    },
    {
      title: 'Configurações',
      href: '/admin/config',
      icon: '⚙️',
      description: 'Configurações do sistema'
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
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-lg"
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
        w-64 bg-white shadow-lg transform transition-transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-purple-600 text-white">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Administrador</div>
                <div className="text-sm text-gray-500">admin@pupiloslani.com.br</div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full mt-2 flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}